import { createStore } from "@stencil/store";

export const reactiveMedia = (query: string) => {
  const media = matchMedia(query);
  const store = createStore({
    matches: media.matches,
  });
  media.onchange = () => {
    store.state.matches = media.matches;
  };
  return {
    get matches() {
      return store.get("matches");
    },
    dispose() {
      media.onchange = null;
      store.dispose();
    },
  };
};

export const goal = (event: string) => {
  try {
    const plausible = (window as any).plausible;
    if (typeof plausible === "function") {
      plausible(event);
    }
  } catch (e) {
    console.error(e);
  }
};
