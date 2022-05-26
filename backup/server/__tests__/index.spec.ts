/* eslint-disable filenames/match-regex */
import * as http from 'http';

import { manual } from '../index';
import { HotModuleServer } from '../components/hot-module-service';

function startServer(): Promise<http.Server> {
  const server = http.createServer();
  return new Promise((resolve) => {
    server.listen(() => resolve(server));
  });
}

describe('webpack-hmr-server', () => {
  let httpServer: http.Server;

  beforeAll(async () => {
    httpServer = await startServer();
  });

  afterAll(() => {
    httpServer.close();
  });

  it('index.spec', async () => {
    const instance = manual(httpServer);
    expect(instance).toBeInstanceOf(HotModuleServer);
  });
});
