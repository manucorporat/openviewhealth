import { initialize } from "@sethealth/core";

let activated = false;

export function isActivated() {
  return activated;
}

export function isJustActivated() {
  const url = new URL(location.href);
  return url.searchParams.get("unlock") === "OTjw9Yx79y";
}

export default () => {
  if (isJustActivated()) {
    activated = true;
    localStorage.setItem("openview-activated", "true");
  } else {
    activated = localStorage.getItem("openview-activated") === "true";
  }
  initialize(
    "pub_openview-health_MOFKawZuosvcxmtiPJf2ABVMMAVQD7Rq304qQElQ258=",
    {
      watermark: false,
    }
  );
};
