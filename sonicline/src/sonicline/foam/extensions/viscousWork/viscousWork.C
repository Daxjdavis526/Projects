/*---------------------------------------------------------------------------*\
    SONICLINE extension for ESI OpenFOAM v2512 (GPL-3.0-or-later, as OpenFOAM)
    See viscousWork.H.
\*---------------------------------------------------------------------------*/

#include "viscousWork.H"
#include "fvMatrices.H"
#include "fvcDiv.H"
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
    eqn += fvc::div(fvc::interpolate(tauU) & mesh_.Sf());
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
