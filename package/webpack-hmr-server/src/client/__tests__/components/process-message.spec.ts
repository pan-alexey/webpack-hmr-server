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
  // it('Remote refresh', async () => {
  //   const processMessage = new ProcessMessage(null);

  //   const event = await processMessage.getEvent({
  //     action: 'refresh',
  //   });

  //   expect(event).toEqual({
  //     message: 'Remote refresh',
  //     refresh: true,
  //     action: 'refresh',
  //     modules: [],
  //   });
  // });

  // it('Remote refresh', async () => {
  //   const processMessage = new ProcessMessage(null);

  //   const event = await processMessage.getEvent({
  //     action: 'init',
  //   });

  //   expect(event).toEqual({
  //     message: 'Not valid state',
  //     refresh: false,
  //     action: 'init',
  //     modules: [],
  //   });
  // });

  // it('Hot module reload disable', async () => {
  //   const processMessage = new ProcessMessage(null);

  //   const event = await processMessage.getEvent({
  //     action: 'init',
  //     state: {
  //       client: {
  //         warnings: [],
  //         errors: [],
  //       },
  //     },
  //   });

  //   expect(event).toEqual({
  //     message: 'Hot module reload disable',
  //     refresh: false,
  //     action: 'init',
  //     modules: [],
  //     state: {
  //       client: {
  //         warnings: [],
  //         errors: [],
  //       },
  //     },
  //   });
  // });

  it('module.hot:single hash updates', async () => {
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

  // it('module.hot:single hash updates', async () => {
  //   Object.assign(global, { __webpack_hash__: '' });

  //   // fixtures
  //   const moduleHot = new ModuleHotFixtures({
  //     nullable: false,
  //   });

  //   // Hack for testing
  //   const moduleCheck = new ModuleCheck(moduleHot as unknown as __WebpackModuleApi.Hot);

  //   const processMessage = new ProcessMessage(moduleCheck);

  //   const event = await processMessage.getEvent({
  //     action: 'init',
  //     state: {
  //       client: {
  //         hash: '',
  //         warnings: [],
  //         errors: [],
  //       },
  //     },
  //   });

  //   expect(event).toEqual({
  //     message: 'Already update',
  //     refresh: false,
  //     state: { client: { hash: '', warnings: [], errors: [] } },
  //     action: 'init',
  //     modules: [],
  //   });
  // });

  // it('Build with error', async () => {
  //   Object.assign(global, { __webpack_hash__: 0 });

  //   // fixtures
  //   const moduleHot = new ModuleHotFixtures({
  //     nullable: false,
  //     updateWebpackHash: true, // enable auto update __webpack_hash__
  //   });

  //   // Note
  //   // Т/к мы запускаем проверку модулей с авто применением,
  //   // то в этом шаге произходит пересчет __webpack_hash__
  //   // фикстура инкрементирует значением каждый вызова moduleHot.check
  //   // Эмулируем случай, что бэкенд передал нам хеш
  //   const moduleCheck = new ModuleCheck(moduleHot as unknown as __WebpackModuleApi.Hot);

  //   const processMessage = new ProcessMessage(moduleCheck);

  //   const event = await processMessage.getEvent({
  //     action: 'init',
  //     state: {
  //       client: {
  //         hash: '3', // 3 modules
  //         warnings: [],
  //         errors: [],
  //       },
  //     },
  //   });

  //   expect(event).toEqual({
  //     message: 'Modules updated',
  //     refresh: false,
  //     state: { client: { hash: '3', warnings: [], errors: [] } },
  //     action: 'init',
  //     modules: ['0', '1', '2', '3'],
  //   });
  // });

  // it('Modules updated', async () => {
  //   Object.assign(global, { __webpack_hash__: 0 });

  //   // fixtures
  //   const moduleHot = new ModuleHotFixtures({
  //     nullable: false,
  //     updateWebpackHash: true, // enable auto update __webpack_hash__
  //   });

  //   // Note
  //   // Т/к мы запускаем проверку модулей с авто применением,
  //   // то в этом шаге произходит пересчет __webpack_hash__
  //   // фикстура инкрементирует значением каждый вызова moduleHot.check
  //   // Эмулируем случай, что бэкенд передал нам хеш
  //   const moduleCheck = new ModuleCheck(moduleHot as unknown as __WebpackModuleApi.Hot);

  //   const processMessage = new ProcessMessage(moduleCheck);

  //   const event = await processMessage.getEvent({
  //     action: 'init',
  //     state: {
  //       client: {
  //         hash: '3', // 3 modules
  //         warnings: [],
  //         errors: ['123' as unknown as StatsError],
  //       },
  //     },
  //   });

  //   expect(event).toEqual({
  //     message: 'Build with error',
  //     refresh: false,
  //     state: { client: { hash: '3', warnings: [], errors: ['123'] } },
  //     action: 'init',
  //     modules: [],
  //   });
  // });

  // it('Update failed', async () => {
  //   Object.assign(global, { __webpack_hash__: '1' });

  //   // fixtures
  //   const moduleHot = new ModuleHotFixtures({
  //     nullable: true,
  //   });

  //   // Hack for testing
  //   const moduleCheck = new ModuleCheck(moduleHot as unknown as __WebpackModuleApi.Hot);

  //   const processMessage = new ProcessMessage(moduleCheck);

  //   const event = await processMessage.getEvent({
  //     action: 'init',
  //     state: {
  //       client: {
  //         hash: '2',
  //         warnings: [],
  //         errors: [],
  //       },
  //     },
  //   });

  //   expect(event).toEqual({
  //     message: 'Update failed',
  //     refresh: true,
  //     state: { client: { hash: '2', warnings: [], errors: [] } },
  //     action: 'init',
  //     modules: [],
  //   });
  // });
});
