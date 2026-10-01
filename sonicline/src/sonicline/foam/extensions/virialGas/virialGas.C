/*---------------------------------------------------------------------------*\
    SONICLINE extension for OpenFOAM v2512 (GPL-3.0-or-later, as OpenFOAM).
    See virialGas.H.
\*---------------------------------------------------------------------------*/

#include "virialGas.H"
#include "IOstreams.H"

template<class Specie>
Foam::virialGas<Specie>::virialGas(const dictionary& dict)
:
    Specie(dict),
    b_(dict.subDict("equationOfState").get<coeffList>("B")),
    c_(dict.subDict("equationOfState").get<coeffList>("C"))
{}


template<class Specie>
void Foam::virialGas<Specie>::write(Ostream& os) const
{
    Specie::write(os);
    os.beginBlock("equationOfState");
    os.writeEntry("B", b_);
    os.writeEntry("C", c_);
    os.endBlock();
}


template<class Specie>
Foam::Ostream& Foam::operator<<(Ostream& os, const virialGas<Specie>& vg)
{
    vg.write(os);
    return os;
}
