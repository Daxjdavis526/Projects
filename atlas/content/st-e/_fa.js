// Shared bits for the Fourier-analysis lessons of st-e (E1–E5): sources,
// picture builders and the constants every lesson computes rather than types.
import { SI_PI, GIBBS_PEAK, GIBBS_FRAC } from '../../src/viz/model/fa-series.js';

export { SI_PI, GIBBS_PEAK, GIBBS_FRAC };

export const SRC = {
  stein: { label: 'E. M. Stein & R. Shakarchi, Fourier Analysis: An Introduction (Princeton, 2003), ch. 2–5', url: 'https://openlibrary.org/isbn/9780691113845' },
  korner: { label: 'T. W. Körner, Fourier Analysis (Cambridge, 1988)', url: 'https://doi.org/10.1017/CBO9781107049949' },
  boas: { label: 'M. L. Boas, Mathematical Methods in the Physical Sciences, 3rd ed. (Wiley, 2006), ch. 7', url: 'https://openlibrary.org/isbn/9780471198260' },
  rhb: { label: 'K. F. Riley, M. P. Hobson & S. J. Bence, Mathematical Methods for Physics and Engineering, 3rd ed. (Cambridge, 2006), ch. 12–13, 17', url: 'https://doi.org/10.1017/CBO9780511810763' },
  dlmf: { label: 'NIST Digital Library of Mathematical Functions, §6.2 (the sine integral Si)', url: 'https://dlmf.nist.gov/6.2' },
  hewitt: { label: 'E. Hewitt & R. E. Hewitt, “The Gibbs–Wilbraham phenomenon”, Arch. Hist. Exact Sci. 21, 129 (1979)', url: 'https://doi.org/10.1007/BF00330404' },
};

// one period −π…π of a function (dashed) and, if given, a partial sum (blue)
export const period = ({ fn, sum, k, y = [-1.4, 1.4], x = [-3.1416, 3.1416], extra = {} }, caption) => ({
  type: 'graph',
  params: {
    x, y, aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge',
    curves: [
      ...(fn ? [{ fn, color: 'ink3', dash: [5, 4], width: 1.5 }] : []),
      ...(sum ? [{ sum, k, color: 'accent', width: 2.3 }] : []),
      ...(extra.curves || []),
    ],
    ...Object.fromEntries(Object.entries(extra).filter(([key]) => key !== 'curves')),
  },
  caption,
});

// a still fa-series picture (no controls, no readouts unless asked)
export const series = (params, caption) => ({
  type: 'fa-series',
  params: { controls: false, readouts: [], ...params },
  caption,
});

export const r3 = (x) => +x.toPrecision(3);
export const r4 = (x) => +x.toPrecision(4);
