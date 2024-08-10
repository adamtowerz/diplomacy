const baseConfig = require("../../jest.config.base.js");

const packageName = "dashboard";

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  ...baseConfig,
  displayName: packageName,
  moduleNameMapper: {
    "^@/(.*)$": `<rootDir>/src/$1`,
  },
  transform: {},
};
