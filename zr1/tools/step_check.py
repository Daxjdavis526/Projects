"""Read a STEP file back with OpenCASCADE's XCAF reader (the same family
of reader most CAD tools use) and report, per component: name, colour,
solid validity, volume, face count. Exit 1 on any invalid solid.

    python tools/step_check.py model/zr1.step
"""
import sys
from OCP.STEPCAFControl import STEPCAFControl_Reader
from OCP.TDocStd import TDocStd_Document
from OCP.XCAFDoc import XCAFDoc_DocumentTool, XCAFDoc_ColorType
from OCP.TDF import TDF_Label
from OCP.OCP.collections import Sequence_TDF_Label as TDF_LabelSequence
from OCP.TDataStd import TDataStd_Name
from OCP.Quantity import Quantity_Color
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.GProp import GProp_GProps
from OCP.BRepGProp import BRepGProp
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_FACE, TopAbs_SOLID
from OCP.IFSelect import IFSelect_RetDone
from OCP.TCollection import TCollection_ExtendedString

path = sys.argv[1]
doc = TDocStd_Document(TCollection_ExtendedString("doc"))
rd = STEPCAFControl_Reader()
rd.SetColorMode(True)
rd.SetNameMode(True)
if rd.ReadFile(path) != IFSelect_RetDone:
    print("READ FAILED"); sys.exit(1)
rd.Transfer(doc)
st = XCAFDoc_DocumentTool.ShapeTool_s(doc.Main())
ct = XCAFDoc_DocumentTool.ColorTool_s(doc.Main())
labels = TDF_LabelSequence()
st.GetFreeShapes(labels)
bad = 0
def name_of(l):
    n = TDataStd_Name()
    return n.Get().ToExtString() if l.FindAttribute(TDataStd_Name.GetID_s(), n) else "?"
def walk(l, depth):
    global bad
    shape = st.GetShape_s(l)
    comps = TDF_LabelSequence()
    st.GetComponents_s(l, comps)
    if comps.Length() > 0:
        print("  " * depth + f"assembly {name_of(l)}: {comps.Length()} components")
        for i in range(1, comps.Length() + 1):
            c = comps.Value(i)
            ref = c
            from OCP.TDF import TDF_Label
            r = TDF_Label()
            if st.GetReferredShape_s(c, r):
                ref = r
            walk(ref, depth + 1)
        return
    col = Quantity_Color()
    got = (ct.GetColor(shape, XCAFDoc_ColorType.XCAFDoc_ColorSurf, col)
           or ct.GetColor(shape, XCAFDoc_ColorType.XCAFDoc_ColorGen, col))
    sol = TopExp_Explorer(shape, TopAbs_SOLID)
    ns = 0
    while sol.More():
        ns += 1; sol.Next()
    if ns == 0:
        # a colour may sit on the solid sub-shape
        pass
    sub = TopExp_Explorer(shape, TopAbs_SOLID)
    if not got and sub.More():
        got = ct.GetColor(sub.Current(), XCAFDoc_ColorType.XCAFDoc_ColorSurf, col)
    nf = 0
    e = TopExp_Explorer(shape, TopAbs_FACE)
    while e.More():
        nf += 1; e.Next()
    ok = BRepCheck_Analyzer(shape).IsValid()
    g = GProp_GProps(); BRepGProp.VolumeProperties_s(shape, g)
    rgb = f"({col.Red():.2f},{col.Green():.2f},{col.Blue():.2f})" if got else "NO COLOUR"
    print("  " * depth + f"{name_of(l):28s} solids={ns} faces={nf} valid={ok} vol={g.Mass():.1f} mm3 colour={rgb}")
    if not ok or ns == 0:
        bad += 1
for i in range(1, labels.Length() + 1):
    walk(labels.Value(i), 0)
print("FAIL" if bad else "ALL VALID")
sys.exit(1 if bad else 0)
