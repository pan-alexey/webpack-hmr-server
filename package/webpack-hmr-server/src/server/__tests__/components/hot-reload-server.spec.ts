/* eslint-disable filenames/match-regex */
import webpack, { Stats } from 'webpack';
import WebSocket from 'ws';
import webpackFixture from 'webpack-fixture';
import { waitForSocketState, startHttpServer } from '../../../common/__mocks__/fixtures';

import { SERVER_PATH_NAME } from '../../../common/constants';
import {
  processMessage,
  statsToData,
  buildStatsToState,
  HotReloadServer,
  getErrorName,
} from '../../components/hot-reload-server';
import { Data } from '../../../common/types';

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

describe('server/hot-reload-server', () => {
  it('processMessage', () => {
    expect(JSON.parse(processMessage('init'))).toEqual({
      action: 'init',
    });

    expect(
      JSON.parse(
        processMessage('init', {
          client: {
            hash: 'string',
            time: 1000,
            errors: [],
            warnings: [],
          },
          server: {
            errors: [],
            warnings: [],
          },
        }),
      ),
    ).toEqual({
      action: 'init',
      state: {
        client: {
          hash: 'string',
          time: 1000,
          errors: [],
          warnings: [],
        },
        server: {
          errors: [],
          warnings: [],
        },
      },
    });
  });

  it('getErrorName', async () => {
    const err1: webpack.StatsError = {
      message: 'line1\nline2',
    };
    expect(getErrorName(err1)).toBe('line1');

    const err2: webpack.StatsError = {
      message: 'line1\nline2',
      moduleName: 'moduleName',
      file: 'file',
      loc: '1-2:3',
    };

    expect(getErrorName(err2)).toBe('moduleName:1');

    const err3: webpack.StatsError = {
      message: 'line1\nline2',
      file: 'file',
      loc: '1-2:3',
    };

    expect(getErrorName(err3)).toBe('file:1');

    const err4: webpack.StatsError = {
      message: 'line1\nline2',
      file: 'file',
      loc: '',
    };

    expect(getErrorName(err4)).toBe('file');
  });

  it('statsToData', async () => {
    expect(statsToData()).toBe(undefined);

    const { compiler, fs } = webpackFixture(webpackConfig);
    fs.writeFileSync('/index.js', `const text='test'; console.log(text`);
    const stats = await new Promise((resolve) => {
      compiler.run((err, stats) => {
        resolve(stats);
      });
    });

    const data = statsToData(stats as webpack.Stats) as Data;

    expect(data).toStrictEqual({
      hash: expect.any(String),
      time: expect.any(Number),
      warnings: expect.any(Array),
      errors: expect.any(Array),
    });

    expect(data.warnings.length).toBe(0);
    expect(data.errors.length).not.toBe(0);
  });

  it('statsToData', async () => {
    const { compiler, fs } = webpackFixture(webpackConfig);
    fs.writeFileSync('/index.js', `const text='test'; console.log(text`);
    const stats = await new Promise((resolve) => {
      compiler.run((err, stats) => {
        resolve(stats);
      });
    });

    const data = statsToData(stats as webpack.Stats) as Data;

    expect(data).toStrictEqual({
      hash: expect.any(String),
      time: expect.any(Number),
      warnings: expect.any(Array),
      errors: expect.any(Array),
    });

    expect(data.warnings.length).toBe(0);
    expect(data.errors.length).not.toBe(0);
  });

  it('buildStatsToState', async () => {
    const { compiler, fs } = webpackFixture(webpackConfig);
    fs.writeFileSync('/index.js', `const text='test'; console.log(text`);
    const stats = await new Promise((resolve) => {
      compiler.run((err, stats) => {
        resolve(stats);
      });
    });

    const state = buildStatsToState({
      client: stats as Stats,
    });
    // const data = statsToData(stats as webpack.Stats);
    expect(state).toStrictEqual({
      client: {
        hash: expect.any(String),
        time: expect.any(Number),
        warnings: expect.any(Array),
        errors: expect.any(Array),
      },
    });
  });
});

describe('server/hot-reload-server/HotReloadServer', () => {
  it('reload', async () => {
    const { server, port } = await startHttpServer();
    const hotReloadServer = new HotReloadServer(server);
    const socketClient = new WebSocket(`ws://localhost:${port}/${SERVER_PATH_NAME}`);
    await waitForSocketState(socketClient, WebSocket.OPEN);

    socketClient.on('message', (data) => {
      const message = JSON.parse(data.toString());

      expect(message).toEqual({
        action: 'refresh',
      });
      socketClient.close();
    });

    hotReloadServer.refresh();

    await waitForSocketState(socketClient, WebSocket.CLOSED);
    server.close();
  });

  it('reload', async () => {
    const { server, port } = await startHttpServer();
    const hotReloadServer = new HotReloadServer(server);
    const socketClient = new WebSocket(`ws://localhost:${port}/${SERVER_PATH_NAME}`);
    await waitForSocketState(socketClient, WebSocket.OPEN);
    socketClient.on('message', (data) => {
      const message = JSON.parse(data.toString());
      expect(message).toEqual({
        action: 'refresh',
      });
      socketClient.close();
    });

    hotReloadServer.refresh();

    await waitForSocketState(socketClient, WebSocket.CLOSED);
    server.close();
  });

  it('answerResponse:undefined', async () => {
    const mockCallback = jest.fn();
    const servers = {
      init: await startHttpServer(),
      check: await startHttpServer(),
      unknown: await startHttpServer(),
    };

    new HotReloadServer(servers.init.server);
    new HotReloadServer(servers.check.server);
    new HotReloadServer(servers.unknown.server);

    const clients = {
      init: new WebSocket(`ws://localhost:${servers.init.port}/${SERVER_PATH_NAME}`),
      check: new WebSocket(`ws://localhost:${servers.check.port}/${SERVER_PATH_NAME}`),
      unknown: new WebSocket(`ws://localhost:${servers.unknown.port}/${SERVER_PATH_NAME}`),
    };

    await waitForSocketState(clients.init, WebSocket.OPEN);
    await waitForSocketState(clients.check, WebSocket.OPEN);
    await waitForSocketState(clients.unknown, WebSocket.OPEN);

    clients.init.on('message', (data) => {
      mockCallback();
      const message = JSON.parse(data.toString());
      expect(message).toEqual({
        action: 'init',
      });
    });
    clients.init.send('init');

    clients.check.on('message', (data) => {
      mockCallback();
      const message = JSON.parse(data.toString());
      expect(message).toEqual({
        action: 'check',
      });
    });
    clients.check.send('check');

    clients.unknown.on('message', () => {
      mockCallback();
    });
    clients.unknown.send('0');

    await new Promise((resolve) => setTimeout(resolve, 5_000));
    await servers.init.close();
    await servers.check.close();
    await servers.unknown.close();

    expect(mockCallback.mock.calls.length).toEqual(2);
  });

  it('reloadModules', async () => {
    const mockCallback = jest.fn((x) => x);
    const { server, port, close } = await startHttpServer();
    const hotServer = new HotReloadServer(server);

    const client = new WebSocket(`ws://localhost:${port}/${SERVER_PATH_NAME}`);
    await waitForSocketState(client, WebSocket.OPEN);
    client.on('message', (data) => {
      const message = JSON.parse(data.toString());
      mockCallback(message);
    });

    // 1. Init before build
    client.send('init');
    await new Promise((resolve) => setTimeout(resolve, 1_000));

    // 2. Build
    const webpacks = {
      client: webpackFixture(webpackConfig),
      server: webpackFixture(webpackConfig), // with error;
    };

    webpacks.client.fs.writeFileSync('/index.js', `const text='test'; console.log(text)`);
    webpacks.server.fs.writeFileSync('/index.js', `const text='test'; console.log(text`);

    const statsServer = await new Promise((resolve) => {
      webpacks.server.compiler.run((err, stats) => {
        resolve(stats);
      });
    });

    const clientServer = await new Promise((resolve) => {
      webpacks.client.compiler.run((err, stats) => {
        resolve(stats);
      });
    });

    hotServer.reloadModules({
      client: clientServer as Stats,
      server: statsServer as Stats,
    });
    await new Promise((resolve) => setTimeout(resolve, 1_000));

    // 3. check after build
    client.send('check');
    await new Promise((resolve) => setTimeout(resolve, 1_000));

    // mockCallback.mock.calls[x][0] => 0 - The first argument of the call function
    expect(mockCallback.mock.results[0].value).toEqual({
      action: 'init',
    });

    expect(mockCallback.mock.results[1].value).toEqual({
      action: 'build',
      state: {
        client: {
          hash: expect.any(String),
          time: expect.any(Number),
          warnings: expect.any(Array),
          errors: expect.any(Array),
        },
        server: {
          hash: expect.any(String),
          time: expect.any(Number),
          warnings: expect.any(Array),
          errors: expect.any(Array),
        },
      },
    });

    expect(mockCallback.mock.results[2].value).toEqual({
      action: 'check',
      state: {
        client: {
          hash: expect.any(String),
          time: expect.any(Number),
          warnings: expect.any(Array),
          errors: expect.any(Array),
        },
        server: {
          hash: expect.any(String),
          time: expect.any(Number),
          warnings: expect.any(Array),
          errors: expect.any(Array),
        },
      },
    });
    await close();
  });
});
