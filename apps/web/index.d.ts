export {};

declare global {
  interface Window {
    RDKit: any;
    initRDKitModule: any;
  }
}