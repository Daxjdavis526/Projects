/*---------------------------------------------------------------------------*\
    SONICLINE extension for ESI OpenFOAM v2512 (GPL-3.0-or-later, as OpenFOAM)

Class
    Foam::fv::viscousWork

Description
    Adds the work of the viscous stress, div(tau & U), to the energy equation
    of rhoPimpleFoam.

    rhoPimpleFoam solves energy in total-energy form -- it carries the kinetic
    energy K explicitly -- but has no viscous-work term, so friction never
    heats the gas and an adiabatic wall recovers far too little of the
    dynamic temperature. ESI's viscousDissipation source adds tau:grad(U),
    which is correct for an internal-energy equation only and, added to this
    one, heats the gas twice. The missing term is the full divergence
    div(tau & U) = tau:grad(U) + U & div(tau). Being a divergence, it moves
    energy within the boundary layer and adds none overall: its volume
    integral is the flux of tau & U through the boundaries, zero at no-slip
    walls.

    tau is the effective (laminar plus turbulent) deviatoric stress,
    -devRhoReff() of the compressible turbulence model.

Usage
    In constant/fvOptions, with libs ("libsoniclineFvOptions.so") in
    controlDict:

        viscousWork
        {
            type    viscousWork;
            active  yes;
        }

\*---------------------------------------------------------------------------*/

#ifndef Foam_fv_viscousWork_H
#define Foam_fv_viscousWork_H

#include "fvOption.H"

namespace Foam
{
namespace fv
{

class viscousWork
:
    public fv::option
{
    //- Name of the velocity field
    word UName_;

public:

    TypeName("viscousWork");

    viscousWork
    (
        const word& sourceName,
        const word& modelType,
        const dictionary& dict,
        const fvMesh& mesh
    );

    virtual ~viscousWork() = default;

    //- Density-weighted energy equation (the compressible solvers call this)
    virtual void addSup
    (
        const volScalarField& rho,
        fvMatrix<scalar>& eqn,
        const label fieldi
    );

    //- The incompressible form makes no sense here
    virtual void addSup(fvMatrix<scalar>& eqn, const label fieldi);

    virtual bool read(const dictionary& dict);
};

} // End namespace fv
} // End namespace Foam

#endif
