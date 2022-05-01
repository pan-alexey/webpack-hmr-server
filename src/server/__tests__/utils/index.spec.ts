/* eslint-disable filenames/match-regex */

import stripAnsi from '../../utils/strip-ansi';

describe('server/utils', () => {
  it('index.spec', async () => {
    expect(stripAnsi('\u001B[4mUnicorn\u001B[0m')).toBe('Unicorn');
  });
});
