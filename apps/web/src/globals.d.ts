declare const fontkit: any;

declare global {
  interface Window {
    test: () => Promise<void> | void;
  }
}

export {};
