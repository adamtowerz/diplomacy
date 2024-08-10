import baseConfig from "../../jest.config.base.js";

const packageName = "megalith";

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  ...baseConfig,
  displayName: packageName,
  rootDir: "../..",
  passWithNoTests: true,
  roots: [`<rootDir>/deployments/${packageName}`],
  transform: {
    "\\.tsx?$": "ts-jest",
    "\\.jsx?$": "babel-jest",
  },
  transformIgnorePatterns: [],
  moduleNameMapper: {
    "^lodash-es$": "lodash",
  },
};
