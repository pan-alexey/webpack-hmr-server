/* eslint-disable filenames/match-regex */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest',
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleDirectories: ['node_modules'],
  testRegex: '(/__tests__/.*|(\\.|/)(spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  modulePathIgnorePatterns: ['__mocks__'],
};
