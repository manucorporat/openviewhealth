import { PrerenderConfig } from '@stencil/core';

export const config: PrerenderConfig = {
  hydrateOptions() {
    return {
      hashAssets: undefined,
    }
  }
};