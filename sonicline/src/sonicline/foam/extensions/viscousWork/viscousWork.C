/*---------------------------------------------------------------------------*\
    SONICLINE extension for ESI OpenFOAM v2512 (GPL-3.0-or-later, as OpenFOAM)
    See viscousWork.H.
\*---------------------------------------------------------------------------*/

#include "viscousWork.H"
#include "fvMatrices.H"
#include "fvcDiv.H"
#include "wallFvPatch.H"
#include "turbulentFluidThermoModel.H"
#include "basicThermo.H"
#include "addToRunTimeSelectionTable.H"

namespace Foam
{
namespace fv
{
    defineTypeNameAndDebug(viscousWork, 0);
    addToRunTimeSelectionTable(option, viscousWork, dictionary);
}
}


Foam::fv::viscousWork::viscousWork
(
    const word& sourceName,
    const word& modelType,
    const dictionary& dict,
    const fvMesh& mesh
)
:
    fv::option(sourceName, modelType, dict, mesh),
    UName_(coeffs_.getOrDefault<word>("U", "U"))
{
    const auto* thermoPtr = mesh_.findObject<basicThermo>(basicThermo::dictName);
    if (!thermoPtr)
    {
        FatalErrorInFunction
            << "viscousWork needs a compressible thermophysical model"
            << exit(FatalError);
    }
    fieldNames_.resize(1, thermoPtr->he().name());
    fv::option::resetApplied();
}


void Foam::fv::viscousWork::addSup
(
    const volScalarField& rho,
    fvMatrix<scalar>& eqn,
    const label fieldi
)
{
    const auto& U = mesh_.lookupObject<volVectorField>(UName_);
    const auto& turb = mesh_.lookupObject<compressible::turbulenceModel>
    (
        turbulenceModel::propertiesName
    );

    // tau & U with tau = -devRhoReff, integrated over each cell's faces.
    const volVectorField tauU(-(turb.devRhoReff() & U));
    surfaceScalarField work(fvc::interpolate(tauU) & mesh_.Sf());

    // No work crosses a stationary wall. With no slip U = 0 there and this
    // changes nothing; with velocity slip the face carries tau & U_slip,
    // which would leave the gas as work on the wall. At a still wall that
    // sliding friction is dissipated where the gas meets it and stays in the
    // gas (SONICLINE DESIGN.md finding 73: with it removed, slip cost E3a
    // 2.6 % of its total temperature through an adiabatic wall).
    forAll(mesh_.boundary(), patchi)
    {
        if (isA<wallFvPatch>(mesh_.boundary()[patchi]))
        {
            work.boundaryFieldRef()[patchi] = Zero;
        }
    }
    eqn += fvc::div(work);
}


void Foam::fv::viscousWork::addSup
(
    fvMatrix<scalar>& eqn,
    const label fieldi
)
{
    FatalErrorInFunction
        << "viscousWork applies to the density-weighted energy equation of a "
        << "compressible solver" << exit(FatalError);
}


bool Foam::fv::viscousWork::read(const dictionary& dict)
{
    if (fv::option::read(dict))
    {
        coeffs_.readIfPresent("U", UName_);
        return true;
    }
    return false;
}
