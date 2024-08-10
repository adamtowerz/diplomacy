/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePaths: ["src"],
  modulePathIgnorePatterns: ["dist"],
  testMatch: ["**/*.test.?(m)js?(x)", "**/*.test.ts?(x)"],
  moduleFileExtensions: ["js", "json", "jsx", "node", "mjs", "ts", "tsx"],
};
