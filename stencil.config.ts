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
      baseUrl: 'https://openview.set.health',
      prerenderConfig: './prerendering-config.ts',
      serviceWorker: {
        runtimeCaching: [{
          urlPattern: /^https:\/\/js\.set\.health\//,
          handler: 'CacheFirst',
        }],

      }
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
