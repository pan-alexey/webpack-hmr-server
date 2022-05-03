/* eslint-disable filenames/match-regex */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  roots: ["<rootDir>/scripts"],
  testEnvironment: "node",
  transform: {
    "^.+\\.(js|jsx)?$": "babel-jest",
    "^.+\\.(t|j)sx?$": "ts-jest",
  },
  testTimeout: 60_000,
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  moduleDirectories: ["node_modules"],
  testRegex: "(/.*|(\\.|/)(spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  modulePathIgnorePatterns: ["__mocks__"],
};
