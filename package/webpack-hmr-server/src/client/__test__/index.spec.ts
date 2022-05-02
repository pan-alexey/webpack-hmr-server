/* eslint-disable filenames/match-regex */
import webpack from 'webpack';
import { HotModuleClient } from '../index';
import { Events, ModuleData, Message, ServerActions } from '../../common/types';

const webpackConfig: webpack.Configuration = {
  entry: '/index.js',
  mode: 'production',
  output: {
    filename: 'bundle.js',
    path: '/build',
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 20,
    maxAssetSize: 20,
  },
};

// const replaceModiles = (moduleData: ModuleData, serverAction: ServerActions) => {};
// const sendEvent = (event: Events) => {
//   expect(event).toEqual({ message: 'Server message error', moduleData: null });
//   console.log(event);
// };

describe('HotModuleClient', () => {
  it('Server message error', async () => {
    const fnSendEvent = jest.fn();
    const pageReload = jest.fn();
    const replaceModiles = jest.fn();
    const sendEvent = (event: Events) => {
      fnSendEvent();
      expect(event).toEqual({ message: 'Server message error', moduleData: null });
    };

    const hotModuleClient = new HotModuleClient({
      sendEvent,
      pageReload,
      replaceModiles,
    });

    hotModuleClient.emit('');
    expect(fnSendEvent.mock.calls.length).toEqual(1);
    expect(pageReload.mock.calls.length).toEqual(0);
    expect(replaceModiles.mock.calls.length).toEqual(0);
  });

  it('Remote reload', async () => {
    const fnSendEvent = jest.fn();
    const pageReload = jest.fn();
    const replaceModiles = jest.fn();
    const sendEvent = (event: Events) => {
      fnSendEvent();
      expect(event).toEqual({ message: 'Remote reload', serverAction: 'reload', moduleData: null });
    };

    const hotModuleClient = new HotModuleClient({
      sendEvent,
      pageReload,
      replaceModiles,
    });

    hotModuleClient.emit(
      JSON.stringify({
        action: 'reload',
      }),
    );

    hotModuleClient.emit(
      JSON.stringify({
        action: 'reload',
        data: null,
      }),
    );

    hotModuleClient.emit(
      JSON.stringify({
        action: 'reload',
        data: null,
      }),
    );

    expect(fnSendEvent.mock.calls.length).toEqual(3);
    expect(pageReload.mock.calls.length).toEqual(3);
    expect(replaceModiles.mock.calls.length).toEqual(0);
  });

  it('Module data is null', async () => {
    const fnSendEvent = jest.fn();
    const pageReload = jest.fn();
    const replaceModiles = jest.fn();
    const sendEvent = (event: Events) => {
      fnSendEvent();
      expect(event).toEqual({
        message: 'Module data is null',
        serverAction: 'test',
        moduleData: null,
      });
    };

    const hotModuleClient = new HotModuleClient({
      sendEvent,
      pageReload,
      replaceModiles,
    });

    hotModuleClient.emit(
      JSON.stringify({
        action: 'test',
        data: null,
      }),
    );

    expect(fnSendEvent.mock.calls.length).toEqual(1);
    expect(pageReload.mock.calls.length).toEqual(0);
    expect(replaceModiles.mock.calls.length).toEqual(0);
  });

  it('Build error', async () => {
    const fnSendEvent = jest.fn();
    const pageReload = jest.fn();
    const replaceModiles = jest.fn();

    const mockError = [{ err: 'mockError' }] as unknown as webpack.StatsError[];

    const sendEvent = (event: Events) => {
      fnSendEvent();
      expect(event).toEqual({
        message: 'Build error',
        serverAction: 'build',
        moduleData: { name: '', errors: mockError, warnings: [] },
      });
    };

    const hotModuleClient = new HotModuleClient({
      sendEvent,
      pageReload,
      replaceModiles,
    });

    const message: Message = {
      action: 'build',
      data: {
        name: '',
        errors: mockError,
        warnings: [],
      },
    };
    hotModuleClient.emit(JSON.stringify(message));

    expect(fnSendEvent.mock.calls.length).toEqual(1);
    expect(pageReload.mock.calls.length).toEqual(0);
    expect(replaceModiles.mock.calls.length).toEqual(0);
  });

  it('Module data is null', async () => {
    const fnSendEvent = jest.fn();
    const pageReload = jest.fn();
    const replaceModiles = jest.fn();

    // send events in replaceModiles
    // but dont need to testing replaceModiles
    const sendEvent = () => {
      fnSendEvent();
    };

    const hotModuleClient = new HotModuleClient({
      sendEvent,
      pageReload,
      replaceModiles,
    });

    hotModuleClient.emit(
      JSON.stringify({
        action: 'init',
        data: {
          name: '',
          errors: [],
          warnings: [],
        },
      }),
    );

    hotModuleClient.emit(
      JSON.stringify({
        action: 'check',
        data: {
          name: '',
          errors: [],
          warnings: [],
        },
      }),
    );

    hotModuleClient.emit(
      JSON.stringify({
        action: 'build',
        data: {
          name: '',
          errors: [],
          warnings: [],
        },
      }),
    );

    expect(fnSendEvent.mock.calls.length).toEqual(0);
    expect(pageReload.mock.calls.length).toEqual(0);
    expect(replaceModiles.mock.calls.length).toEqual(3);
  });
});
