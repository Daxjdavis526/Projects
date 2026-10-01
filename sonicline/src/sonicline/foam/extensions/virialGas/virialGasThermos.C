/*---------------------------------------------------------------------------*\
    SONICLINE extension for OpenFOAM v2512 (GPL-3.0-or-later, as OpenFOAM).

    psiThermo with the virial equation of state: hePsiThermo / pureMixture
    / {const, sutherland} transport / {hConst, janaf} thermo / virialGas /
    {sensibleInternalEnergy, sensibleEnthalpy}: every combination the
    solvers select from thermophysicalProperties once this library is listed
    in controlDict "libs". Internal energy is what rhoCentralFoam needs (it
    solves for rho E); OpenFOAM derives it for any equation of state as
    e = h - p/rho, cv = cp - (cp - cv), both exact for the virial gas.
    janaf carries a temperature-dependent ideal-gas cp (heated gas).
\*---------------------------------------------------------------------------*/

#include "psiThermo.H"
#include "makeThermo.H"
#include "specie.H"
#include "virialGas.H"
#include "hConstThermo.H"
#include "janafThermo.H"
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
        constTransport,
        sensibleInternalEnergy,
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
        sensibleInternalEnergy,
        janafThermo,
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

    makeThermos
    (
        psiThermo,
        hePsiThermo,
        pureMixture,
        constTransport,
        sensibleEnthalpy,
        janafThermo,
        virialGas,
        specie
    );

    makeThermos
    (
        psiThermo,
        hePsiThermo,
        pureMixture,
        sutherlandTransport,
        sensibleInternalEnergy,
        hConstThermo,
        virialGas,
        specie
    );

    makeThermos
    (
        psiThermo,
        hePsiThermo,
        pureMixture,
        sutherlandTransport,
        sensibleInternalEnergy,
        janafThermo,
        virialGas,
        specie
    );

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
        sutherlandTransport,
        sensibleEnthalpy,
        janafThermo,
        virialGas,
        specie
    );
}
