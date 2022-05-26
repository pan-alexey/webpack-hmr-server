/* eslint-disable filenames/match-regex */
import { unique } from '../../helpers/index';

describe('client/helpers', () => {
  it('uniq', async () => {
    expect(unique([1, 2, 1, '1'])).toEqual(['1', '2']);
  });
});
