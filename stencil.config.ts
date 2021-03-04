import { Config } from '@stencil/core';

// https://stenciljs.com/docs/config

export const config: Config = {
  namespace: "openview",
  globalStyle: 'src/global/app.css',
  globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  buildEs5: false,
  outputTargets: [
    {
      type: 'www',
      baseUrl: 'https://openview.health'
    }
  ],
  extras: {
    dynamicImportShim: false,
    cssVarsShim: false,
    shadowDomShim: false,
    scriptDataOpts: false,
    safari10: false,
  },
};
