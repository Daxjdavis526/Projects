/*---------------------------------------------------------------------------*\
    SONICLINE extension for OpenFOAM v2512 (GPL-3.0-or-later, as OpenFOAM).

    psiThermo with the virial equation of state: hePsiThermo / pureMixture
    / sutherland or const transport / hConst / virialGas / sensibleEnthalpy,
    the combinations rhoPimpleFoam selects from thermophysicalProperties
    once this library is listed in controlDict "libs".
\*---------------------------------------------------------------------------*/

#include "psiThermo.H"
#include "makeThermo.H"
#include "specie.H"
#include "virialGas.H"
#include "hConstThermo.H"
#include "sensibleEnthalpy.H"
#include "sensibleInternalEnergy.H"
#include "thermo.H"
#include "constTransport.H"
#include "sutherlandTransport.H"
#include "hePsiThermo.H"
#include "pureMixture.H"

namespace Foam
{
    makeThermos
    (
        psiThermo,
        hePsiThermo,
        pureMixture,
        sutherlandTransport,
        sensibleEnthalpy,
        hConstThermo,
        virialGas,
        specie
    );

    makeThermos
    (
        psiThermo,
        hePsiThermo,
        pureMixture,
        constTransport,
        sensibleEnthalpy,
        hConstThermo,
        virialGas,
        specie
    );
}
