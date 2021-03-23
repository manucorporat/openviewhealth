import { MedSourceRaw, MedSourceNifty, MedSourceNRRD } from "@sethealth/core";

export const ANKLE: MedSourceNRRD = {
  type: "nrrd",
  input: "https://public.sethealth.app/ankle.nrrd.gz",
};

export const SCAN: MedSourceNRRD = {
  type: "nrrd",
  input: "https://sethealth.b-cdn.net/torax.nrrd.gz",
};

export const MANIX = ((): MedSourceRaw => {
  const input = "https://public.sethealth.app/manix.raw.gz";

  const meta = {
    rescaleIntercept: -1000,
    reversePixels: true,
    scaleInMM: {
      x: 0.488281 * 512,
      y: 0.488281 * 512,
      z: 0.700012 * 460,
    },
    dimensions: {
      x: 512,
      y: 512,
      z: 460,
    },
  };
  return {
    type: "raw",
    input,
    meta,
  };
})();

export const COVID19 = ((): MedSourceNifty => {
  const input =
    "https://public.sethealth.app/covid19/coronacases_org_001.nii.gz";
  return {
    type: "nifty",
    input,
  };
})();
