export declare global {
  interface Window {
    injectTestMass: (options: {
      dailyCount: number;
      weeklyPerDay: number;
      includeInactive: boolean;
    }) => void;
  }
}
