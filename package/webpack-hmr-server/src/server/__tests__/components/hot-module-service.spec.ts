/* eslint-disable filenames/match-regex */
import webpack from 'webpack';
import WebSocket from 'ws';
import webpackFixture from 'webpack-fixture';
import { waitForSocketState, startHttpServer } from '../__mocks__/fixtures';

import { processMessage, HotModuleServer } from '../../components/hot-module-service';
import { SERVER_PATH_NAME } from '../../../common/constants';

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

describe('server/HotModuleServer', () => {
  it('processMessage', () => {
    expect(JSON.parse(processMessage('init', null))).toEqual({
      action: 'init',
      data: null,
    });

    expect(
      JSON.parse(
        processMessage('init', {
          errors: [],
          warnings: [],
        }),
      ),
    ).toEqual({
      action: 'init',
      data: {
        errors: [],
        warnings: [],
      },
    });
  });

  it('HotModuleServer/processStats', async () => {
    const { server, port } = await startHttpServer();
    const hotModuleServer = new HotModuleServer(server);

    const socketClient = new WebSocket(`ws://localhost:${port}/${SERVER_PATH_NAME}`);

    await waitForSocketState(socketClient, WebSocket.OPEN);
    // webpack compile to memfs
    const { compiler, fs } = webpackFixture(webpackConfig);
    fs.writeFileSync('/index.js', `const text='test'; console.log(text)`);
    const stats = await new Promise((resolve) => {
      compiler.run((err, stats) => {
        resolve(stats);
      });
    });

    socketClient.on('message', (data) => {
      const message = JSON.parse(data.toString());
      expect(message.action).toBe('build');
      expect(message.data).toStrictEqual({
        hash: (stats as webpack.Stats).hash,
        time: expect.any(Number),
        warnings: expect.any(Array),
        errors: expect.any(Array),
      });

      socketClient.close();
    });

    hotModuleServer.processStats(stats as webpack.Stats);

    await waitForSocketState(socketClient, WebSocket.CLOSED);
    server.close();
  });

  it('HotModuleServer/processReload', async () => {
    const { server, port } = await startHttpServer();
    const hotModuleServer = new HotModuleServer(server);

    const socketClient = new WebSocket(`ws://localhost:${port}/${SERVER_PATH_NAME}`);
    socketClient.on('message', (data) => {
      const message = JSON.parse(data.toString());

      expect(message).toEqual({
        action: 'reload',
        data: null,
      });
      socketClient.close();
    });

    await waitForSocketState(socketClient, WebSocket.OPEN);
    hotModuleServer.processReload();

    await waitForSocketState(socketClient, WebSocket.CLOSED);
    server.close();
    expect(null).toBeNull();
  });

  it('HotModuleServer/listen', async () => {
    const { server, port } = await startHttpServer();
    const hotModuleServer = new HotModuleServer(server);

    const socketClient1 = new WebSocket(`ws://localhost:${port}/${SERVER_PATH_NAME}`);
    const socketClient2 = new WebSocket(`ws://localhost:${port}/${SERVER_PATH_NAME}`);
    const socketClient3 = new WebSocket(`ws://localhost:${port}/${SERVER_PATH_NAME}`);

    const mockClientCallback1 = jest.fn();
    const mockClientCallback2 = jest.fn();
    const mockClientCallback3 = jest.fn();

    await waitForSocketState(socketClient1, WebSocket.OPEN);
    await waitForSocketState(socketClient2, WebSocket.OPEN);
    await waitForSocketState(socketClient3, WebSocket.OPEN);

    // webpack compile to memfs
    const { compiler, fs } = webpackFixture(webpackConfig);
    fs.writeFileSync('/index.js', `const text='test'; console.log(text)`);
    const stats = await new Promise((resolve) => {
      compiler.run((err, stats) => {
        resolve(stats);
      });
    });
    hotModuleServer.processStats(stats as webpack.Stats);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // After build, hotModuleServer memoize prew data
    socketClient1.on('message', (data) => {
      mockClientCallback1();
      const message = JSON.parse(data.toString());
      expect(message.action).toBe('init');
      expect(message.data).toStrictEqual({
        hash: (stats as webpack.Stats).hash,
        time: expect.any(Number),
        warnings: expect.any(Array),
        errors: expect.any(Array),
      });
    });
    socketClient1.send('init');

    socketClient2.on('message', (data) => {
      mockClientCallback2();
      const message = JSON.parse(data.toString());
      expect(message.action).toBe('check');
      expect(message.data).toStrictEqual({
        hash: (stats as webpack.Stats).hash,
        time: expect.any(Number),
        warnings: expect.any(Array),
        errors: expect.any(Array),
      });
    });
    socketClient2.send('check');

    // no calls
    socketClient3.on('message', () => {
      mockClientCallback3();
    });
    socketClient3.send('__test__');

    await new Promise((resolve) =>
      setTimeout(() => {
        socketClient1.close();
        socketClient2.close();
        socketClient3.close();
        resolve(null);
      }, 1000),
    );

    await waitForSocketState(socketClient1, WebSocket.CLOSED);
    await waitForSocketState(socketClient2, WebSocket.CLOSED);
    await waitForSocketState(socketClient3, WebSocket.CLOSED);
    server.close();

    expect(mockClientCallback1.mock.calls.length).toEqual(1);
    expect(mockClientCallback2.mock.calls.length).toEqual(1);
    expect(mockClientCallback3.mock.calls.length).toEqual(0);
  });
});
