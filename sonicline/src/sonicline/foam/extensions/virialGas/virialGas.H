/*---------------------------------------------------------------------------*\
    SONICLINE extension for OpenFOAM v2512 (GPL-3.0-or-later, as OpenFOAM).

Class
    Foam::virialGas

Description
    Pressure-explicit virial equation of state, truncated after the third
    coefficient:

        v(p, T) = R T/p + B(T) + D(T) p,     D = (C - B^2)/(R T)

    with B(T) and C(T) the density-form second and third virial
    coefficients (Z = 1 + B rho + C rho^2), each a polynomial in 1/T:

        B(T) = sum_k b_k T^-k,   C(T) = sum_k c_k T^-k,   k = 0..4

    per unit mass (B in m^3/kg, C in m^6/kg^2). Density is explicit, so the
    psiThermo framework needs no root finding. The caloric departures from
    the ideal gas follow exactly from v(p, T):

        h - h_ig  = p (B - T B') + p^2/2 (D - T D')
        cp - cp_ig = -T (p B'' + p^2/2 D'')
        s - s_ig  = -p B' - p^2/2 D'

    For nitrogen fitted to the reference equation of state (Span et al.
    2000) it reproduces the real-gas choked mass flux to 0.013 % from 10 to
    30 bar (SONICLINE DESIGN.md section 17). Valid where the truncated
    series is: densities well below critical (the gas side, away from the
    critical point).

    Dictionary:
        equationOfState
        {
            B   (b0 b1 b2 b3 b4);
            C   (c0 c1 c2 c3 c4);
        }

SourceFiles
    virialGasI.H
    virialGas.C

\*---------------------------------------------------------------------------*/

#ifndef virialGas_H
#define virialGas_H

#include "autoPtr.H"
#include "FixedList.H"

namespace Foam
{

template<class Specie> class virialGas;

template<class Specie>
inline virialGas<Specie> operator+(const virialGas<Specie>&, const virialGas<Specie>&);

template<class Specie>
inline virialGas<Specie> operator*(const scalar, const virialGas<Specie>&);

template<class Specie>
inline virialGas<Specie> operator==(const virialGas<Specie>&, const virialGas<Specie>&);

template<class Specie>
Ostream& operator<<(Ostream&, const virialGas<Specie>&);


template<class Specie>
class virialGas
:
    public Specie
{
public:

    typedef FixedList<scalar, 5> coeffList;

private:

        coeffList b_;
        coeffList c_;

        //- B, D and their first two temperature derivatives
        inline void coeffs
        (
            const scalar T,
            scalar& B, scalar& B1, scalar& B2,
            scalar& D, scalar& D1, scalar& D2
        ) const;

public:

        inline virialGas(const Specie& sp, const coeffList& b, const coeffList& c);

        virialGas(const dictionary& dict);

        inline virialGas(const word& name, const virialGas&);

        inline autoPtr<virialGas> clone() const;

        inline static autoPtr<virialGas> New(const dictionary& dict);

        static word typeName()
        {
            return "virialGas<" + word(Specie::typeName_()) + '>';
        }

        static const bool incompressible = false;
        static const bool isochoric = false;

        inline scalar rho(scalar p, scalar T) const;
        inline scalar H(const scalar p, const scalar T) const;
        inline scalar Cp(scalar p, scalar T) const;
        inline scalar E(const scalar p, const scalar T) const;
        inline scalar Cv(scalar p, scalar T) const;
        inline scalar S(const scalar p, const scalar T) const;
        inline scalar psi(scalar p, scalar T) const;
        inline scalar Z(scalar p, scalar T) const;
        inline scalar CpMCv(scalar p, scalar T) const;

        void write(Ostream& os) const;

        inline void operator+=(const virialGas&);
        inline void operator*=(const scalar);

        friend virialGas operator+ <Specie>(const virialGas&, const virialGas&);
        friend virialGas operator* <Specie>(const scalar s, const virialGas&);
        friend virialGas operator== <Specie>(const virialGas&, const virialGas&);
        friend Ostream& operator<< <Specie>(Ostream&, const virialGas&);
};

} // End namespace Foam

#include "virialGasI.H"

#ifdef NoRepository
    #include "virialGas.C"
#endif

#endif
