using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// Four-dimensional geometry for the tesseract: rotations of 4-space, the
/// sixteen corners and thirty-two edges of a hypercube, and its perspective
/// projection into three dimensions (the familiar cube within a cube, which
/// turns itself inside out as the hypercube rotates through the fourth axis).
/// A 4×4 rotation is handed to the shader as a <see cref="Projection"/>, which
/// arrives there as a mat4.
/// </summary>
public static class Hyper
{
    /// <summary>A 4×4 matrix, row-major: M[row, col].</summary>
    public sealed class Mat
    {
        public readonly double[,] M = new double[4, 4];

        public static Mat Identity()
        {
            var m = new Mat();
            for (int i = 0; i < 4; i++) m.M[i, i] = 1;
            return m;
        }

        /// <summary>A rotation by `angle` in the plane of axes a and b (0 = x, 1 = y, 2 = z, 3 = w), turning a toward b.</summary>
        public static Mat Plane(int a, int b, double angle)
        {
            var m = Identity();
            double c = Math.Cos(angle), s = Math.Sin(angle);
            m.M[a, a] = c; m.M[a, b] = -s;
            m.M[b, a] = s; m.M[b, b] = c;
            return m;
        }

        public static Mat operator *(Mat x, Mat y)
        {
            var r = new Mat();
            for (int i = 0; i < 4; i++)
                for (int j = 0; j < 4; j++)
                {
                    double s = 0;
                    for (int k = 0; k < 4; k++) s += x.M[i, k] * y.M[k, j];
                    r.M[i, j] = s;
                }
            return r;
        }

        public Vector4 Apply(Vector4 v)
        {
            Span<double> a = stackalloc double[] { v.X, v.Y, v.Z, v.W };
            Span<double> o = stackalloc double[4];
            for (int i = 0; i < 4; i++) o[i] = M[i, 0] * a[0] + M[i, 1] * a[1] + M[i, 2] * a[2] + M[i, 3] * a[3];
            return new Vector4((float)o[0], (float)o[1], (float)o[2], (float)o[3]);
        }

        /// <summary>As a shader mat4 (Godot's Projection is column-major, as GLSL is).</summary>
        public Projection ToProjection() => new(
            new Vector4((float)M[0, 0], (float)M[1, 0], (float)M[2, 0], (float)M[3, 0]),
            new Vector4((float)M[0, 1], (float)M[1, 1], (float)M[2, 1], (float)M[3, 1]),
            new Vector4((float)M[0, 2], (float)M[1, 2], (float)M[2, 2], (float)M[3, 2]),
            new Vector4((float)M[0, 3], (float)M[1, 3], (float)M[2, 3], (float)M[3, 3]));

        /// <summary>Largest deviation of M·Mᵀ from the identity: 0 for a true rotation.</summary>
        public double OrthoError()
        {
            double worst = 0;
            for (int i = 0; i < 4; i++)
                for (int j = 0; j < 4; j++)
                {
                    double s = 0;
                    for (int k = 0; k < 4; k++) s += M[i, k] * M[j, k];
                    worst = Math.Max(worst, Math.Abs(s - (i == j ? 1 : 0)));
                }
            return worst;
        }
    }

    /// <summary>
    /// The orientation of the slice of 4-space the player sees at time t:
    /// slow turns in the three planes that reach into w (which is what makes
    /// the lattice's beams shear, split and merge), and one in xz.
    /// </summary>
    public static Mat Slice(double t) =>
        Mat.Plane(0, 3, 0.31 + 0.071 * t) * Mat.Plane(1, 3, 0.53 * Math.Sin(t * 0.043)) * Mat.Plane(2, 3, 0.2 + 0.052 * t) * Mat.Plane(0, 2, 0.023 * t);

    /// <summary>A double rotation (two planes at once, at different rates): the motion only four dimensions allow.</summary>
    public static Mat Double(double t, double rate1, double rate2, double phase = 0) =>
        Mat.Plane(0, 3, rate1 * t + phase) * Mat.Plane(1, 2, rate2 * t + phase * 0.7);

    /// <summary>The corners of the hypercube [−1, 1]⁴: corner i has coordinate k = +1 where bit k of i is set.</summary>
    public static Vector4[] Corners()
    {
        var c = new Vector4[16];
        for (int i = 0; i < 16; i++)
            c[i] = new Vector4((i & 1) != 0 ? 1 : -1, (i & 2) != 0 ? 1 : -1, (i & 4) != 0 ? 1 : -1, (i & 8) != 0 ? 1 : -1);
        return c;
    }

    /// <summary>The edges: pairs of corners that differ in exactly one coordinate (one bit).</summary>
    public static List<(int a, int b)> Edges()
    {
        var e = new List<(int, int)>();
        for (int i = 0; i < 16; i++)
            for (int k = 0; k < 4; k++)
            {
                int j = i ^ (1 << k);
                if (j > i) e.Add((i, j));
            }
        return e;
    }

    /// <summary>
    /// Perspective from four dimensions to three: a viewer at w = <paramref name="eye"/>
    /// sees a point at w shrunk by eye / (eye − w), so the far cell (w = −1) is
    /// the small inner cube and the near one (w = +1) the large outer one.
    /// </summary>
    public static Vector3 Project(Vector4 p, float eye = 3f)
    {
        float k = eye / (eye - p.W);
        return new Vector3(p.X, p.Y, p.Z) * k;
    }
}
