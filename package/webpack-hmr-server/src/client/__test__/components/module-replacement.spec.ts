/* eslint-disable filenames/match-regex */
import { UserException, webpackHashCheck } from '../../components/module-replacement';

describe('client/module-replacement', () => {
  it('UserException', async () => {
    try {
      throw new UserException({
        message: '__test__message__',
        pageReload: true,
      });
    } catch (error) {
      const resultError = error as Record<string, unknown>;
      expect(resultError.message).toBe('__test__message__');
      expect(resultError.pageReload).toBe(true);
    }
  });

  it('webpackHashCheck', async () => {
    // patch global varrible
    Object.assign(global, { __webpack_hash__: '123' });
    const hashCheck = webpackHashCheck();

    expect(hashCheck()).toBe(true);

    expect(hashCheck('____')).toBe(false);

    // patch global varrible
    Object.assign(global, { __webpack_hash__: '321' });

    expect(hashCheck()).toBe(false);
    expect(hashCheck('123')).toBe(false);
    expect(hashCheck('321')).toBe(true);
  });
});
