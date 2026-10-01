/*---------------------------------------------------------------------------*\
    SONICLINE extension for OpenFOAM v2512 (GPL-3.0-or-later, as OpenFOAM).
    See virialGas.H.
\*---------------------------------------------------------------------------*/

#include "virialGas.H"

template<class Specie>
inline Foam::virialGas<Specie>::virialGas
(
    const Specie& sp,
    const coeffList& b,
    const coeffList& c
)
:
    Specie(sp),
    b_(b),
    c_(c)
{}


template<class Specie>
inline Foam::virialGas<Specie>::virialGas(const word& name, const virialGas& vg)
:
    Specie(name, vg),
    b_(vg.b_),
    c_(vg.c_)
{}


template<class Specie>
inline Foam::autoPtr<Foam::virialGas<Specie>> Foam::virialGas<Specie>::clone() const
{
    return autoPtr<virialGas<Specie>>::New(*this);
}


template<class Specie>
inline Foam::autoPtr<Foam::virialGas<Specie>>
Foam::virialGas<Specie>::New(const dictionary& dict)
{
    return autoPtr<virialGas<Specie>>::New(dict);
}


template<class Specie>
inline void Foam::virialGas<Specie>::coeffs
(
    const scalar T,
    scalar& B, scalar& B1, scalar& B2,
    scalar& D, scalar& D1, scalar& D2
) const
{
    scalar C = 0, C1 = 0, C2 = 0;
    B = B1 = B2 = 0;
    scalar Tk = 1;  // T^-k
    for (label k = 0; k < 5; ++k)
    {
        B += b_[k]*Tk;
        B1 -= k*b_[k]*Tk/T;
        B2 += k*(k + 1)*b_[k]*Tk/(T*T);
        C += c_[k]*Tk;
        C1 -= k*c_[k]*Tk/T;
        C2 += k*(k + 1)*c_[k]*Tk/(T*T);
        Tk /= T;
    }
    // D = N/(R T), N = C - B^2
    const scalar RT = this->R()*T;
    const scalar N = C - B*B;
    const scalar N1 = C1 - 2*B*B1;
    const scalar N2 = C2 - 2*B1*B1 - 2*B*B2;
    D = N/RT;
    D1 = N1/RT - N/(RT*T);
    D2 = N2/RT - 2*N1/(RT*T) + 2*N/(RT*T*T);
}


template<class Specie>
inline Foam::scalar Foam::virialGas<Specie>::rho(scalar p, scalar T) const
{
    return p*psi(p, T);
}


template<class Specie>
inline Foam::scalar Foam::virialGas<Specie>::H(scalar p, scalar T) const
{
    scalar B, B1, B2, D, D1, D2;
    coeffs(T, B, B1, B2, D, D1, D2);
    return p*(B - T*B1) + 0.5*p*p*(D - T*D1);
}


template<class Specie>
inline Foam::scalar Foam::virialGas<Specie>::Cp(scalar p, scalar T) const
{
    scalar B, B1, B2, D, D1, D2;
    coeffs(T, B, B1, B2, D, D1, D2);
    return -T*(p*B2 + 0.5*p*p*D2);
}


template<class Specie>
inline Foam::scalar Foam::virialGas<Specie>::E(scalar p, scalar T) const
{
    // e - e_ig = (h - h_ig) - (p v - R T)
    scalar B, B1, B2, D, D1, D2;
    coeffs(T, B, B1, B2, D, D1, D2);
    return H(p, T) - (B*p + D*p*p);
}


template<class Specie>
inline Foam::scalar Foam::virialGas<Specie>::Cv(scalar p, scalar T) const
{
    // cv - cv_ig = (cp - cp_ig) - ((cp - cv) - R)
    return Cp(p, T) - CpMCv(p, T) + this->R();
}


template<class Specie>
inline Foam::scalar Foam::virialGas<Specie>::S(scalar p, scalar T) const
{
    scalar B, B1, B2, D, D1, D2;
    coeffs(T, B, B1, B2, D, D1, D2);
    return -this->R()*log(p/Pstd) - p*B1 - 0.5*p*p*D1;
}


template<class Specie>
inline Foam::scalar Foam::virialGas<Specie>::psi(scalar p, scalar T) const
{
    // rho/p = 1/(p v), written without dividing by p
    scalar B, B1, B2, D, D1, D2;
    coeffs(T, B, B1, B2, D, D1, D2);
    return 1.0/(this->R()*T + B*p + D*p*p);
}


template<class Specie>
inline Foam::scalar Foam::virialGas<Specie>::Z(scalar p, scalar T) const
{
    scalar B, B1, B2, D, D1, D2;
    coeffs(T, B, B1, B2, D, D1, D2);
    return 1.0 + (B*p + D*p*p)/(this->R()*T);
}


template<class Specie>
inline Foam::scalar Foam::virialGas<Specie>::CpMCv(scalar p, scalar T) const
{
    // T (dv/dT)_p^2 / -(dv/dp)_T, multiplied through by p^2
    scalar B, B1, B2, D, D1, D2;
    coeffs(T, B, B1, B2, D, D1, D2);
    const scalar R = this->R();
    return T*sqr(R + B1*p + D1*p*p)/(R*T - D*p*p);
}


template<class Specie>
inline void Foam::virialGas<Specie>::operator+=(const virialGas<Specie>& vg)
{
    const scalar Y1 = this->Y();
    Specie::operator+=(vg);
    if (mag(this->Y()) > SMALL)
    {
        const scalar w1 = Y1/this->Y();
        const scalar w2 = vg.Y()/this->Y();
        for (label k = 0; k < 5; ++k)
        {
            b_[k] = w1*b_[k] + w2*vg.b_[k];
            c_[k] = w1*c_[k] + w2*vg.c_[k];
        }
    }
}


template<class Specie>
inline void Foam::virialGas<Specie>::operator*=(const scalar s)
{
    Specie::operator*=(s);
}


template<class Specie>
Foam::virialGas<Specie> Foam::operator+
(
    const virialGas<Specie>& vg1,
    const virialGas<Specie>& vg2
)
{
    virialGas<Specie> out(vg1);
    out += vg2;
    return out;
}


template<class Specie>
Foam::virialGas<Specie> Foam::operator*
(
    const scalar s,
    const virialGas<Specie>& vg
)
{
    virialGas<Specie> out(vg);
    out *= s;
    return out;
}


template<class Specie>
Foam::virialGas<Specie> Foam::operator==
(
    const virialGas<Specie>& vg1,
    const virialGas<Specie>& vg2
)
{
    // Used by reacting mixtures only; a pure gas keeps its coefficients.
    return virialGas<Specie>
    (
        static_cast<const Specie&>(vg1) == static_cast<const Specie&>(vg2),
        vg2.b_,
        vg2.c_
    );
}
