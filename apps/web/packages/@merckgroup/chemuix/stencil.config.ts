import { Config } from "@stencil/core";
import { string } from "rollup-plugin-string";

export const config: Config = {
  namespace: "chemuix",
  plugins: [
    string({
      include: "**/*.svg",
    }),
  ],
  outputTargets: [
    {
      type: "dist",
      esmLoaderPath: "../loader",
    },
    {
      type: "dist-custom-elements",
    },
    {
      type: "docs-readme",
    },
    {
      type: "www",
      serviceWorker: null, // disable service workers
    },
  ],
  testing: {
    browserArgs: ["--no-sandbox", "--disable-setuid-sandbox"],
    browserHeadless: "new",
    transformIgnorePatterns: ["/node_modules/(?!d3|d3-array|three)"],
    transform: {
      "^.+\\.(ts|tsx|js|jsx|css)$": "@stencil/core/testing/jest-preprocessor",
    },
    moduleNameMapper: {
      "d3": "<rootDir>/node_modules/d3/dist/d3.min.js",
      "^d3-(.*)$": "<rootDir>/node_modules/d3-$1/dist/d3-$1.min.js",
    },
  },
};
