type ViewTransitionDocument = Document & {
  startViewTransition?: (fn: () => void) => void;
};

export function withThemeTransition(fn: () => void) {
  const doc = document as ViewTransitionDocument;
  if (typeof doc.startViewTransition === "function") {
    doc.startViewTransition(fn);
  } else {
    fn();
  }
}
