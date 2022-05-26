/* eslint-disable filenames/match-regex */
import { ModuleCheck } from '../../components/hot-replace';
import { ModuleHotFixtures } from './__mocks__/fixtures';

beforeEach(() => {
  // delete global.module?.hot;
  delete global.__webpack_hash__;
});

describe('client/hot-replace', () => {
  it('webpackHashCheck', async () => {
    // patch global var
    Object.assign(global, { __webpack_hash__: '123' });

    // fixtures
    const moduleHot = new ModuleHotFixtures({
      nullable: false,
    });

    // Hack for testing
    const moduleCheck = new ModuleCheck(moduleHot as unknown as __WebpackModuleApi.Hot);

    expect(moduleCheck.webpackHashCheck()).toBe(true);

    expect(moduleCheck.webpackHashCheck('____')).toBe(false);

    // patch global varrible
    Object.assign(global, { __webpack_hash__: '321' });

    expect(moduleCheck.webpackHashCheck()).toBe(false);
    expect(moduleCheck.webpackHashCheck('123')).toBe(false);
    expect(moduleCheck.webpackHashCheck('321')).toBe(true);
  });

  it('module.hot:null', async () => {
    Object.assign(global, { __webpack_hash__: '' });

    // fixtures
    const moduleHot = new ModuleHotFixtures({
      nullable: true,
    });

    // Hack for testing
    const moduleCheck = new ModuleCheck(moduleHot as unknown as __WebpackModuleApi.Hot);

    const message = await moduleCheck.check();
    expect(message).toEqual(null);
  });

  it('module.hot:single hash updates', async () => {
    Object.assign(global, { __webpack_hash__: '' });

    // fixtures
    const moduleHot = new ModuleHotFixtures({
      nullable: false,
    });

    // Hack for testing
    const moduleCheck = new ModuleCheck(moduleHot as unknown as __WebpackModuleApi.Hot);
    const modules = await moduleCheck.check();

    expect(modules).toEqual(['0', '1']);
  });

  it('module.hot:many hash updates', async () => {
    Object.assign(global, { __webpack_hash__: 0 });

    // fixtures
    const moduleHot = new ModuleHotFixtures({
      nullable: false,
      updateWebpackHash: true, // enable auto update __webpack_hash__
    });

    // Hack for testing
    const moduleCheck = new ModuleCheck(moduleHot as unknown as __WebpackModuleApi.Hot);

    // Note
    // Т/к мы запускаем проверку модулей с авто применением,
    // то в этом шаге произходит пересчет __webpack_hash__
    // фикстура инкрементирует значением каждый вызова moduleHot.check

    // Эмулируем случай, что бэкенд передал нам хеш
    moduleCheck.webpackHashCheck('3');

    const module = await moduleCheck.check();
    expect(module).toEqual(['0', '1', '2', '3']);
  });

  it('module.hot:disable', async () => {
    Object.assign(global, { __webpack_hash__: 0 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moduleCheck = new ModuleCheck();
    expect(moduleCheck.hotEnable()).toBe(false);
    const modules = await moduleCheck.check();
    expect(modules).toBe(null);
  });
});
