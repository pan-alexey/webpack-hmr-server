/* eslint-disable filenames/match-regex */
import { ProcessMessage } from '../../components/process-message';
import { ModuleCheck } from '../../components/hot-replace';
import { ModuleHotFixtures } from './__mocks__/fixtures';
import { StatsError } from 'webpack';

beforeEach(() => {
  // delete global.module?.hot;
  delete global.__webpack_hash__;
});

describe('client/process-message', () => {
  it('Remote refresh', async () => {
    Object.assign(global, { __webpack_hash__: '1' });

    // Fixtures
    const moduleHot = new ModuleHotFixtures({ nullable: false });
    const moduleCheck = new ModuleCheck(moduleHot as unknown as __WebpackModuleApi.Hot);
    const processMessage = new ProcessMessage(moduleCheck);

    const event = await processMessage.getEvent({
      action: 'refresh',
    });

    expect(event).toEqual({
      message: 'Remote refresh',
      refresh: true,
      action: 'refresh',
      modules: [],
    });
  });

  it('Not valid state', async () => {
    Object.assign(global, { __webpack_hash__: '1' });

    // Fixtures
    const moduleHot = new ModuleHotFixtures({ nullable: false });
    const moduleCheck = new ModuleCheck(moduleHot as unknown as __WebpackModuleApi.Hot);
    const processMessage = new ProcessMessage(moduleCheck);

    const event = await processMessage.getEvent({
      action: 'init',
    });

    expect(event).toEqual({
      message: 'Not valid state',
      refresh: false,
      action: 'init',
      modules: [],
    });
  });

  it('Already update', async () => {
    Object.assign(global, { __webpack_hash__: '1' });

    // fixtures
    const moduleHot = new ModuleHotFixtures({
      nullable: false,
    });

    // Hack for testing
    const moduleCheck = new ModuleCheck(moduleHot as unknown as __WebpackModuleApi.Hot);

    const processMessage = new ProcessMessage(moduleCheck);

    const event = await processMessage.getEvent({
      action: 'init',
      state: {
        client: {
          hash: '1',
          warnings: [],
          errors: [],
        },
      },
    });

    expect(event).toEqual({
      message: 'Already update',
      refresh: false,
      state: { client: { hash: '1', warnings: [], errors: [] } },
      action: 'init',
      modules: [],
    });
  });

  it('Build with error', async () => {
    Object.assign(global, { __webpack_hash__: '1' });

    // fixtures
    const moduleHot = new ModuleHotFixtures({
      nullable: false,
    });

    // Hack for testing
    const moduleCheck = new ModuleCheck(moduleHot as unknown as __WebpackModuleApi.Hot);

    const processMessage = new ProcessMessage(moduleCheck);

    const eventClient = await processMessage.getEvent({
      action: 'init',
      state: {
        client: {
          warnings: [],
          errors: ['123' as unknown as StatsError],
        },
      },
    });

    const eventServer = await processMessage.getEvent({
      action: 'init',
      state: {
        client: {
          warnings: [],
          errors: [],
        },
        server: {
          warnings: [],
          errors: ['123' as unknown as StatsError],
        },
      },
    });

    expect(eventClient).toEqual({
      message: 'Build with error',
      refresh: false,
      state: { client: { warnings: [], errors: ['123'] } },
      action: 'init',
      modules: [],
    });

    expect(eventServer).toEqual({
      message: 'Build with error',
      refresh: false,
      state: {
        client: { warnings: [], errors: [] },
        server: { warnings: [], errors: ['123'] },
      },
      action: 'init',
      modules: [],
    });
  });

  it('Modules updated', async () => {
    Object.assign(global, { __webpack_hash__: 0 });

    // fixtures
    const moduleHot = new ModuleHotFixtures({
      nullable: false,
      updateWebpackHash: true, // enable auto update __webpack_hash__
    });

    // Note
    // Т/к мы запускаем проверку модулей с авто применением,
    // то в этом шаге произходит пересчет __webpack_hash__
    // фикстура инкрементирует значением каждый вызова moduleHot.check
    // Эмулируем случай, что бэкенд передал нам хеш
    const moduleCheck = new ModuleCheck(moduleHot as unknown as __WebpackModuleApi.Hot);

    const processMessage = new ProcessMessage(moduleCheck);

    const event = await processMessage.getEvent({
      action: 'init',
      state: {
        client: {
          hash: '3', // 3 modules
          warnings: [],
          errors: [],
        },
      },
    });

    expect(event).toEqual({
      message: 'Modules updated',
      refresh: false,
      state: { client: { hash: '3', warnings: [], errors: [] } },
      action: 'init',
      modules: ['0', '1', '2', '3'],
    });
  });

  it('Hot module reload disable', async () => {
    Object.assign(global, { __webpack_hash__: 0 });

    // Note
    // Т/к мы запускаем проверку модулей с авто применением,
    // то в этом шаге произходит пересчет __webpack_hash__
    // фикстура инкрементирует значением каждый вызова moduleHot.check
    // Эмулируем случай, что бэкенд передал нам хеш
    const moduleCheck = new ModuleCheck();

    const processMessage = new ProcessMessage(moduleCheck);

    const event = await processMessage.getEvent({
      action: 'init',
      state: {
        client: {
          hash: '3', // 3 modules
          warnings: [],
          errors: [],
        },
      },
    });

    expect(event).toEqual({
      message: 'Hot module reload disable',
      refresh: true,
      state: { client: { hash: '3', warnings: [], errors: [] } },
      action: 'init',
      modules: [],
    });
  });

  it('module.hot:null', async () => {
    Object.assign(global, { __webpack_hash__: '' });

    // fixtures
    const moduleHot = new ModuleHotFixtures({
      nullable: true,
    });

    // Hack for testing
    const moduleCheck = new ModuleCheck(moduleHot as unknown as __WebpackModuleApi.Hot);

    const processMessage = new ProcessMessage(moduleCheck);

    const event = await processMessage.getEvent({
      action: 'init',
      state: {
        client: {
          hash: '3', // 3 modules
          warnings: [],
          errors: [],
        },
      },
    });

    expect(event).toEqual({
      message: 'Update failed',
      refresh: true,
      state: { client: { hash: '3', warnings: [], errors: [] } },
      action: 'init',
      modules: [],
    });
  });
});
