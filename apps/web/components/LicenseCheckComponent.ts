"use client";

import config from "devextreme/core/config";

export default function LicenseCheckComponent() {
  if (typeof window !== "undefined") {
    config({
      licenseKey: process.env.NEXT_PUBLIC_DEVEXTREME_KEY
    });
  }
  return null;
}