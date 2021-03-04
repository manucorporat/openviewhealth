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
