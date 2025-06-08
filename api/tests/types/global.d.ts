declare global {
  namespace globalThis {
    var testUtils: {
      wait: (ms: number) => Promise<void>;
      generateTestUser: () => any;
      generateTestProduct: () => any;
      generateTestQualityCheck: () => any;
    };
  }
  
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R;
      toBeValidEmail(): R;
    }
  }
}

export {};