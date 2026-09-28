namespace Strata;

public sealed class LaunchComplex
{
    private readonly LandmarkSite _site;
    private readonly Canvas _c;
    private Rng _r;
    public LaunchComplex(LandmarkSite site, Canvas c, Rng r) { _site = site; _c = c; _r = r; }
    public void Build() { }
}
