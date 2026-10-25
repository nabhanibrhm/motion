import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

// Static Titillium Web weights (still referenced by old scenes via `f1.font`).
const TITILLIUM: [number, string][] = [
  [400, "Regular"],
  [600, "SemiBold"],
  [700, "Bold"],
  [900, "Black"],
];

// Variable fonts for the illustrated look: [family, file, weight range].
const VARIABLE: [string, string, string][] = [
  ["Bricolage Grotesque", "fonts/BricolageGrotesque.ttf", "200 800"], // display
  ["Nunito Sans", "fonts/NunitoSans.ttf", "200 1000"], // body
];

let loading: Promise<void> | null = null;

// Loads every font once; renders wait on it via delayRender.
export const loadF1Fonts = () => {
  if (loading || typeof document === "undefined") return loading;
  const handle = delayRender("Loading fonts");
  const faces = [
    ...TITILLIUM.map(async ([weight, name]) => {
      const face = new FontFace("Titillium Web", `url(${staticFile(`fonts/TitilliumWeb-${name}.ttf`)})`, {
        weight: String(weight),
      });
      document.fonts.add(await face.load());
    }),
    ...VARIABLE.map(async ([family, file, weight]) => {
      const face = new FontFace(family, `url(${staticFile(file)})`, { weight });
      document.fonts.add(await face.load());
    }),
  ];
  loading = Promise.all(faces)
    .then(() => continueRender(handle))
    .catch((err) => cancelRender(err));
  return loading;
};
