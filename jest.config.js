// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const baseConfig = require("./jest.config.base.js");

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
  ...baseConfig,
  projects: ["<rootDir>/packages/*/jest.config.js", "<rootDir>/deployments/*/jest.config.js"],
  moduleDirectories: ["node_modules"],
  roots: [],
};
