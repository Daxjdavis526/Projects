//! Writers for the built parts.
//!
//! - **STEP** (ISO 10303-21, AP214 "automotive design"): an assembly,
//!   one named component per part, each a `FACETED_BREP` — a closed
//!   solid of planar triangular faces — coloured with the AP214
//!   presentation entities (`STYLED_ITEM` → `COLOUR_RGB`). SolidWorks,
//!   Fusion, Onshape, FreeCAD and OpenCASCADE read it as solid bodies
//!   with their colours.
//! - **GLB** (glTF 2.0 binary): the same meshes with physically-based
//!   materials for the browser viewer; glTF is +Y up, so the car's
//!   z-up frame is rotated on the way out.
//!
//! Both are written at MODEL scale, millimetres, origin on the ground
//! under the centre of the wheelbase.

use std::fmt::Write as _;
use std::path::Path;

use odawn_geo::Vec3;

use crate::part::Built;

/// Full-scale car point → model millimetres, z up, origin on the ground
/// midway between the axles, +x toward the REAR.
fn model_pt(p: Vec3, scale: f64, x_mid: f64) -> [f64; 3] {
    model(p, scale, x_mid)
}

fn model(p: Vec3, scale: f64, x_mid: f64) -> [f64; 3] {
    [(p.x - x_mid) * scale, p.y * scale, p.z * scale]
}

/// A STEP real: always with a decimal point.
fn r(v: f64, digits: usize) -> String {
    let v = if v.abs() < 0.5 * 10f64.powi(-(digits as i32)) { 0.0 } else { v };
    let mut s = format!("{v:.digits$}");
    if s.contains('.') {
        while s.ends_with('0') {
            s.pop();
        }
    }
    if !s.contains('.') {
        s.push('.');
    }
    s
}

struct Sink {
    out: String,
    next: usize,
}

impl Sink {
    fn add(&mut self, body: &str) -> usize {
        let id = self.next;
        self.next += 1;
        let _ = writeln!(self.out, "#{id}={body};");
        id
    }
}

/// Write the parts as one coloured STEP assembly.
pub fn write_step(
    parts: &[Built],
    scale: f64,
    x_mid: f64,
    name: &str,
    description: &str,
    path: &Path,
) -> std::io::Result<u64> {
    let mut s = Sink {
        out: String::with_capacity(64 << 20),
        next: 1,
    };
    let _ = writeln!(s.out, "ISO-10303-21;\nHEADER;");
    let _ = writeln!(s.out, "FILE_DESCRIPTION(('{}'),'2;1');", description.replace('\'', ""));
    let _ = writeln!(
        s.out,
        "FILE_NAME('{name}.step','2026-10-10T00:00:00',(''),(''),'zr1 (Orbital Dawn geometry kernel)','zr1','');"
    );
    let _ = writeln!(s.out, "FILE_SCHEMA(('AUTOMOTIVE_DESIGN {{ 1 0 10303 214 1 1 1 1 }}'));");
    let _ = writeln!(s.out, "ENDSEC;\nDATA;");

    let app = s.add("APPLICATION_CONTEXT('core data for automotive mechanical design processes')");
    s.add(&format!(
        "APPLICATION_PROTOCOL_DEFINITION('international standard','automotive_design',2000,#{app})"
    ));
    let pctx = s.add(&format!("PRODUCT_CONTEXT('',#{app},'mechanical')"));
    let dctx = s.add(&format!("PRODUCT_DEFINITION_CONTEXT('part definition',#{app},'design')"));
    let mm = s.add("(LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.))");
    let rad = s.add("(NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.))");
    let sr = s.add("(NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT())");
    let unc = s.add(&format!(
        "UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-04),#{mm},'distance_accuracy_value','confusion accuracy')"
    ));
    let ctx = s.add(&format!(
        "(GEOMETRIC_REPRESENTATION_CONTEXT(3) GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#{unc})) GLOBAL_UNIT_ASSIGNED_CONTEXT((#{mm},#{rad},#{sr})) REPRESENTATION_CONTEXT('','3D'))"
    ));

    // A product with its definition chain; returns (definition, definition shape).
    let product = |s: &mut Sink, pname: &str| -> (usize, usize) {
        let p = s.add(&format!("PRODUCT('{pname}','{pname}','',(#{pctx}))"));
        s.add(&format!("PRODUCT_RELATED_PRODUCT_CATEGORY('part',$,(#{p}))"));
        let f = s.add(&format!("PRODUCT_DEFINITION_FORMATION('','',#{p})"));
        let d = s.add(&format!("PRODUCT_DEFINITION('design','',#{f},#{dctx})"));
        let ds = s.add(&format!("PRODUCT_DEFINITION_SHAPE('','',#{d})"));
        (d, ds)
    };
    let placement = |s: &mut Sink| -> usize {
        let o = s.add("CARTESIAN_POINT('',(0.,0.,0.))");
        let z = s.add("DIRECTION('',(0.,0.,1.))");
        let x = s.add("DIRECTION('',(1.,0.,0.))");
        s.add(&format!("AXIS2_PLACEMENT_3D('',#{o},#{z},#{x})"))
    };

    // The assembly root.
    let (root_d, root_ds) = product(&mut s, name);
    let root_ax = placement(&mut s);
    let root_rep = s.add(&format!("SHAPE_REPRESENTATION('{name}',(#{root_ax}),#{ctx})"));
    s.add(&format!("SHAPE_DEFINITION_REPRESENTATION(#{root_ds},#{root_rep})"));

    let mut styled: Vec<usize> = Vec::new();
    for (k, part) in parts.iter().enumerate() {
        let pname = part.name.replace('\'', "");
        let (d, ds) = product(&mut s, &pname);
        // Points.
        let pts: Vec<usize> = part
            .step_mesh
            .vertices_mm()
            .iter()
            .map(|&p| {
                let q = model(p, scale, x_mid);
                s.add(&format!(
                    "CARTESIAN_POINT('',({},{},{}))",
                    r(q[0], 4),
                    r(q[1], 4),
                    r(q[2], 4)
                ))
            })
            .collect();
        // Faces: planar triangles bounded by poly loops.
        let vs = part.step_mesh.vertices_mm();
        let mut faces: Vec<usize> = Vec::with_capacity(part.step_mesh.triangle_count());
        for t in part.step_mesh.triangles() {
            let [a, b, c] = t.map(|i| vs[i as usize]);
            let n = (b - a).cross(c - a);
            let n = n.normalized().unwrap_or(Vec3::new(0.0, 0.0, 1.0));
            let dir = s.add(&format!("DIRECTION('',({},{},{}))", r(n.x, 6), r(n.y, 6), r(n.z, 6)));
            let ax = s.add(&format!("AXIS2_PLACEMENT_3D('',#{},#{dir},$)", pts[t[0] as usize]));
            let pl = s.add(&format!("PLANE('',#{ax})"));
            let lp = s.add(&format!(
                "POLY_LOOP('',(#{},#{},#{}))",
                pts[t[0] as usize], pts[t[1] as usize], pts[t[2] as usize]
            ));
            let fb = s.add(&format!("FACE_OUTER_BOUND('',#{lp},.T.)"));
            faces.push(s.add(&format!("FACE_SURFACE('',(#{fb}),#{pl},.T.)")));
        }
        let list: Vec<String> = faces.iter().map(|f| format!("#{f}")).collect();
        let shell = s.add(&format!("CLOSED_SHELL('',({}))", list.join(",")));
        let brep = s.add(&format!("FACETED_BREP('{pname}',#{shell})"));
        let ax = placement(&mut s);
        let rep = s.add(&format!(
            "FACETED_BREP_SHAPE_REPRESENTATION('{pname}',(#{ax},#{brep}),#{ctx})"
        ));
        s.add(&format!("SHAPE_DEFINITION_REPRESENTATION(#{ds},#{rep})"));
        // Place it in the assembly (identity).
        let nauo = s.add(&format!(
            "NEXT_ASSEMBLY_USAGE_OCCURRENCE('{}','{pname}','',#{root_d},#{d},$)",
            k + 1
        ));
        let nds = s.add(&format!("PRODUCT_DEFINITION_SHAPE('','',#{nauo})"));
        let ax_root = placement(&mut s);
        let idt = s.add(&format!("ITEM_DEFINED_TRANSFORMATION('','',#{ax},#{ax_root})"));
        let rel = s.add(&format!(
            "(REPRESENTATION_RELATIONSHIP('','',#{rep},#{root_rep}) REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION(#{idt}) SHAPE_REPRESENTATION_RELATIONSHIP())"
        ));
        s.add(&format!("CONTEXT_DEPENDENT_SHAPE_REPRESENTATION(#{rel},#{nds})"));
        // Colour.
        let [cr, cg, cb] = part.finish.rgb;
        let col = s.add(&format!(
            "COLOUR_RGB('{}',{},{},{})",
            part.material.replace('\'', ""),
            r(cr as f64, 4),
            r(cg as f64, 4),
            r(cb as f64, 4)
        ));
        let fac = s.add(&format!("FILL_AREA_STYLE_COLOUR('',#{col})"));
        let fa = s.add(&format!("FILL_AREA_STYLE('',(#{fac}))"));
        let ssfa = s.add(&format!("SURFACE_STYLE_FILL_AREA(#{fa})"));
        let sss = s.add(&format!("SURFACE_SIDE_STYLE('',(#{ssfa}))"));
        let ssu = s.add(&format!("SURFACE_STYLE_USAGE(.BOTH.,#{sss})"));
        let psa = s.add(&format!("PRESENTATION_STYLE_ASSIGNMENT((#{ssu}))"));
        styled.push(s.add(&format!("STYLED_ITEM('color',(#{psa}),#{brep})")));
    }
    let list: Vec<String> = styled.iter().map(|f| format!("#{f}")).collect();
    s.add(&format!(
        "MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION('',({}),#{ctx})",
        list.join(",")
    ));
    let _ = writeln!(s.out, "ENDSEC;\nEND-ISO-10303-21;");
    std::fs::write(path, &s.out)?;
    Ok(s.out.len() as u64)
}

/// Per-corner normals with creases kept sharp: a corner takes the mean of
/// the face normals around its vertex that lie within `crease_deg` of its
/// own face. Returns unwelded positions/normals and indices.
fn shade(vs: &[Vec3], ts: &[[u32; 3]], crease_deg: f64) -> (Vec<Vec3>, Vec<Vec3>, Vec<u32>) {
    let fnrm: Vec<Vec3> = ts
        .iter()
        .map(|t| {
            let [a, b, c] = t.map(|i| vs[i as usize]);
            (b - a).cross(c - a)
        })
        .collect();
    let mut around: Vec<Vec<u32>> = vec![Vec::new(); vs.len()];
    for (f, t) in ts.iter().enumerate() {
        for &i in t {
            around[i as usize].push(f as u32);
        }
    }
    let cosc = crease_deg.to_radians().cos();
    let mut pos = Vec::with_capacity(ts.len() * 3);
    let mut nor = Vec::with_capacity(ts.len() * 3);
    let mut idx = Vec::with_capacity(ts.len() * 3);
    // Weld identical (vertex, normal) corners back together to keep size down.
    let mut weld: std::collections::HashMap<(u32, [i32; 3]), u32> = std::collections::HashMap::new();
    for (f, t) in ts.iter().enumerate() {
        let nf = fnrm[f].normalized().unwrap_or(Vec3::new(0.0, 0.0, 1.0));
        for &i in t {
            let mut acc = Vec3::ZERO;
            for &g in &around[i as usize] {
                let ng = fnrm[g as usize];
                if let Some(u) = ng.normalized() {
                    if u.dot(nf) >= cosc {
                        acc = acc + ng;
                    }
                }
            }
            let n = acc.normalized().unwrap_or(nf);
            let key = (
                i,
                [
                    (n.x * 1000.0).round() as i32,
                    (n.y * 1000.0).round() as i32,
                    (n.z * 1000.0).round() as i32,
                ],
            );
            let id = *weld.entry(key).or_insert_with(|| {
                pos.push(vs[i as usize]);
                nor.push(n);
                (pos.len() - 1) as u32
            });
            idx.push(id);
        }
    }
    (pos, nor, idx)
}

/// Write the parts as one GLB (glTF 2.0 binary), +Y up, front toward +Z,
/// model millimetres. Quantised (KHR_mesh_quantization): positions as
/// 16-bit integers inside each part's box (the node's translation and
/// scale restore millimetres — a step of 1/65534 of the part's size,
/// about 5 µm on the body), normals as 8-bit, indices 16-bit where a
/// part has few enough vertices. Half the size of plain floats, which is
/// what a phone downloads.
pub fn write_glb(parts: &[Built], scale: f64, x_mid: f64, path: &Path) -> std::io::Result<u64> {
    let mut bin: Vec<u8> = Vec::new();
    let mut views = Vec::new();
    let mut accessors = Vec::new();
    let mut meshes = Vec::new();
    let mut materials = Vec::new();
    let mut nodes = Vec::new();
    // Car (x rear, y right, z up) → glTF (X left, Y up, Z front).
    let gl = |p: [f64; 3]| -> [f64; 3] { [-p[1], p[2], -p[0]] };
    let pad4 = |bin: &mut Vec<u8>| {
        while bin.len() % 4 != 0 {
            bin.push(0);
        }
    };
    for (k, part) in parts.iter().enumerate() {
        let (pos, nor, idx) = shade(part.mesh.vertices_mm(), part.mesh.triangles(), 35.0);
        let pts: Vec<[f64; 3]> = pos.iter().map(|p| gl(model(*p, scale, x_mid))).collect();
        let mut lo = [f64::MAX; 3];
        let mut hi = [f64::MIN; 3];
        for q in &pts {
            for c in 0..3 {
                lo[c] = lo[c].min(q[c]);
                hi[c] = hi[c].max(q[c]);
            }
        }
        let centre: Vec<f64> = (0..3).map(|c| 0.5 * (lo[c] + hi[c])).collect();
        let half: Vec<f64> = (0..3).map(|c| (0.5 * (hi[c] - lo[c])).max(1e-6)).collect();
        // positions: SHORT normalised, stride 8
        pad4(&mut bin);
        let p_off = bin.len();
        let (mut qlo, mut qhi) = ([i16::MAX; 3], [i16::MIN; 3]);
        for q in &pts {
            for c in 0..3 {
                let v = (((q[c] - centre[c]) / half[c]) * 32767.0).round().clamp(-32767.0, 32767.0) as i16;
                qlo[c] = qlo[c].min(v);
                qhi[c] = qhi[c].max(v);
                bin.extend_from_slice(&v.to_le_bytes());
            }
            bin.extend_from_slice(&[0, 0]);
        }
        // normals: BYTE normalised, stride 4
        let n_off = bin.len();
        for n in &nor {
            let g = gl([n.x, n.y, n.z]);
            for c in g {
                bin.push(((c * 127.0).round().clamp(-127.0, 127.0) as i8) as u8);
            }
            bin.push(0);
        }
        // indices
        pad4(&mut bin);
        let i_off = bin.len();
        let small = pts.len() <= 65535;
        for i in &idx {
            if small {
                bin.extend_from_slice(&(*i as u16).to_le_bytes());
            } else {
                bin.extend_from_slice(&i.to_le_bytes());
            }
        }
        let i_len = bin.len() - i_off;
        let nv = pts.len();
        let vbase = views.len();
        views.push(format!(
            "{{\"buffer\":0,\"byteOffset\":{p_off},\"byteLength\":{},\"byteStride\":8,\"target\":34962}}",
            nv * 8
        ));
        views.push(format!(
            "{{\"buffer\":0,\"byteOffset\":{n_off},\"byteLength\":{},\"byteStride\":4,\"target\":34962}}",
            nv * 4
        ));
        views.push(format!(
            "{{\"buffer\":0,\"byteOffset\":{i_off},\"byteLength\":{i_len},\"target\":34963}}"
        ));
        let abase = accessors.len();
        accessors.push(format!(
            "{{\"bufferView\":{},\"componentType\":5122,\"normalized\":true,\"count\":{nv},\"type\":\"VEC3\",\"min\":[{},{},{}],\"max\":[{},{},{}]}}",
            vbase, qlo[0], qlo[1], qlo[2], qhi[0], qhi[1], qhi[2]
        ));
        accessors.push(format!(
            "{{\"bufferView\":{},\"componentType\":5120,\"normalized\":true,\"count\":{nv},\"type\":\"VEC3\"}}",
            vbase + 1
        ));
        accessors.push(format!(
            "{{\"bufferView\":{},\"componentType\":{},\"count\":{},\"type\":\"SCALAR\"}}",
            vbase + 2,
            if small { 5123 } else { 5125 },
            idx.len()
        ));
        let f = part.finish;
        // glTF base colours are linear; the finishes are given in sRGB.
        let lin = |c: f32| {
            if c <= 0.04045 { c / 12.92 } else { ((c + 0.055) / 1.055).powf(2.4) }
        };
        let blend = if f.alpha < 1.0 {
            ",\"alphaMode\":\"BLEND\",\"doubleSided\":true"
        } else {
            ""
        };
        materials.push(format!(
            "{{\"name\":\"{}\",\"pbrMetallicRoughness\":{{\"baseColorFactor\":[{},{},{},{}],\"metallicFactor\":{},\"roughnessFactor\":{}}}{blend}}}",
            part.material, lin(f.rgb[0]), lin(f.rgb[1]), lin(f.rgb[2]), f.alpha, f.metallic, f.roughness
        ));
        meshes.push(format!(
            "{{\"name\":\"{}\",\"primitives\":[{{\"attributes\":{{\"POSITION\":{},\"NORMAL\":{}}},\"indices\":{},\"material\":{k}}}]}}",
            part.name,
            abase,
            abase + 1,
            abase + 2
        ));
        nodes.push(format!(
            "{{\"name\":\"{}\",\"mesh\":{k},\"translation\":[{},{},{}],\"scale\":[{},{},{}]}}",
            part.name, centre[0], centre[1], centre[2], half[0], half[1], half[2]
        ));
    }
    pad4(&mut bin);
    let node_ids: Vec<String> = (0..nodes.len()).map(|i| i.to_string()).collect();
    let json = format!(
        "{{\"asset\":{{\"version\":\"2.0\",\"generator\":\"zr1 (Orbital Dawn geometry kernel)\"}},\"extensionsUsed\":[\"KHR_mesh_quantization\"],\"extensionsRequired\":[\"KHR_mesh_quantization\"],\"scene\":0,\"scenes\":[{{\"nodes\":[{}]}}],\"nodes\":[{}],\"meshes\":[{}],\"materials\":[{}],\"accessors\":[{}],\"bufferViews\":[{}],\"buffers\":[{{\"byteLength\":{}}}]}}",
        node_ids.join(","),
        nodes.join(","),
        meshes.join(","),
        materials.join(","),
        accessors.join(","),
        views.join(","),
        bin.len()
    );
    let mut jb = json.into_bytes();
    while jb.len() % 4 != 0 {
        jb.push(b' ');
    }
    let total = 12 + 8 + jb.len() + 8 + bin.len();
    let mut out = Vec::with_capacity(total);
    out.extend_from_slice(b"glTF");
    out.extend_from_slice(&2u32.to_le_bytes());
    out.extend_from_slice(&(total as u32).to_le_bytes());
    out.extend_from_slice(&(jb.len() as u32).to_le_bytes());
    out.extend_from_slice(b"JSON");
    out.extend_from_slice(&jb);
    out.extend_from_slice(&(bin.len() as u32).to_le_bytes());
    out.extend_from_slice(b"BIN\0");
    out.extend_from_slice(&bin);
    std::fs::write(path, &out)?;
    Ok(out.len() as u64)
}

/// Write the parts as a 3MF (3D Manufacturing Format) package: one
/// object per part with its display colour, millimetres, z up. SolidWorks
/// opens it directly (as mesh, graphics or solid bodies); slicers take
/// it for multi-material printing.
pub fn write_3mf(parts: &[Built], scale: f64, x_mid: f64, title: &str, path: &Path) -> std::io::Result<u64> {
    use std::io::Write;
    let mut model = String::with_capacity(64 << 20);
    model.push_str("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    model.push_str("<model unit=\"millimeter\" xml:lang=\"en-US\" xmlns=\"http://schemas.microsoft.com/3dmanufacturing/core/2015/02\">\n");
    let _ = writeln!(model, " <metadata name=\"Title\">{title}</metadata>");
    model.push_str(" <metadata name=\"Designer\">zr1 on the Orbital Dawn geometry kernel</metadata>\n <resources>\n  <basematerials id=\"1\">\n");
    for p in parts {
        let [r, g, b] = p.finish.rgb.map(|c| (c.clamp(0.0, 1.0) * 255.0).round() as u8);
        let a = (p.finish.alpha.clamp(0.0, 1.0) * 255.0).round() as u8;
        let _ = writeln!(model, "   <base name=\"{} - {}\" displaycolor=\"#{r:02X}{g:02X}{b:02X}{a:02X}\"/>", p.name, p.material);
    }
    model.push_str("  </basematerials>\n");
    // 3MF wants every coordinate of the build on the positive side of the
    // plate: shift so the model's box starts at the origin.
    let mut lo = [f64::MAX; 3];
    for p in parts {
        for v in p.mesh.vertices_mm() {
            let q = model_pt(*v, scale, x_mid);
            for c in 0..3 {
                lo[c] = lo[c].min(q[c]);
            }
        }
    }
    for (k, p) in parts.iter().enumerate() {
        let _ = writeln!(model, "  <object id=\"{}\" type=\"model\" name=\"{}\" pid=\"1\" pindex=\"{k}\">\n   <mesh>\n    <vertices>", k + 2, p.name);
        for v in p.mesh.vertices_mm() {
            let q = model_pt(*v, scale, x_mid);
            let _ = writeln!(model, "     <vertex x=\"{:.4}\" y=\"{:.4}\" z=\"{:.4}\"/>", q[0] - lo[0], q[1] - lo[1], q[2] - lo[2]);
        }
        model.push_str("    </vertices>\n    <triangles>\n");
        for t in p.mesh.triangles() {
            let _ = writeln!(model, "     <triangle v1=\"{}\" v2=\"{}\" v3=\"{}\"/>", t[0], t[1], t[2]);
        }
        model.push_str("    </triangles>\n   </mesh>\n  </object>\n");
    }
    model.push_str(" </resources>\n <build>\n");
    for k in 0..parts.len() {
        let _ = writeln!(model, "  <item objectid=\"{}\"/>", k + 2);
    }
    model.push_str(" </build>\n</model>\n");

    let file = std::fs::File::create(path)?;
    let mut zip = zip::ZipWriter::new(file);
    let opt = zip::write::SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);
    zip.start_file("[Content_Types].xml", opt)?;
    zip.write_all(br#"<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>
"#)?;
    zip.start_file("_rels/.rels", opt)?;
    zip.write_all(br#"<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>
"#)?;
    zip.start_file("3D/3dmodel.model", opt)?;
    zip.write_all(model.as_bytes())?;
    zip.finish()?;
    Ok(std::fs::metadata(path)?.len())
}
