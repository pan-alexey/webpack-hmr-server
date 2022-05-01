/* eslint-disable filenames/match-regex */

/**
 * original https://github.com/webpack/webpack-dev-server/blob/master/client-src/utils/stripAnsi.js
 */

const ansiRegex = new RegExp(
  [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
  ].join('|'),
  'g',
);

export default (string: string): string => {
  return string.replace(ansiRegex, '');
};
