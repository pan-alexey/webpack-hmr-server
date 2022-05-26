/* eslint-disable filenames/match-regex */
import webpack from 'webpack';
import WebSocket from 'ws';
import webpackFixture from 'webpack-fixture';
import { SERVER_PATH_NAME } from '../../common/constants';
import { waitForSocketState, startHttpServer } from '../../common/__mocks__/fixtures';

import webpackHmrServer from '../index';
import { createHotServer } from '../index';
import { HotReloadServer } from '../components/hot-reload-server';

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

describe('server/index', () => {
  it('createHotServer', async () => {
    const httpServer = await startHttpServer();

    const hotServer = createHotServer(httpServer.server);
    expect(hotServer).toBeInstanceOf(HotReloadServer);

    httpServer.close();
  });

  it('default', async () => {
    const mockCallback = jest.fn((x) => x);
    const { server, port, close } = await startHttpServer();

    const { compiler, fs } = webpackFixture(webpackConfig);
    const application = webpackHmrServer(compiler, server);

    const client = new WebSocket(`ws://localhost:${port}/${SERVER_PATH_NAME}`);
    await waitForSocketState(client, WebSocket.OPEN);
    client.on('message', (data) => {
      const message = JSON.parse(data.toString());
      mockCallback(message);
    });

    // Case refresh
    application.refresh();
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    expect(mockCallback.mock.results[0].value).toEqual({
      action: 'refresh',
    });

    // Case build
    fs.writeFileSync('/index.js', `const text='test'; console.log(text)`);
    await new Promise((resolve) => {
      compiler.run((err, stats) => {
        resolve(stats);
      });
    });

    await new Promise((resolve) => setTimeout(resolve, 1_000));
    expect(mockCallback.mock.results[1].value).toEqual({
      action: 'build',
      state: {
        client: {
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
