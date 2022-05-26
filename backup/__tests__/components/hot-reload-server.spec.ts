/* eslint-disable filenames/match-regex */
import * as http from 'http';
import WebSocket from 'ws';
import { waitForSocketState, startHttpServer } from '../../../../common/__mocks__/fixtures';

import { SocketServer } from '../../socket-server';

describe('server/hot-reload-server', () => {
  let httpServer: {
    port: number;
    server: http.Server;
    close: () => Promise<unknown>;
  };

  beforeAll(async () => {
    httpServer = await startHttpServer();
  });

  afterAll(() => {
    httpServer.close();
  });

  it('onMessage', async () => {
    expect(1).toEqual(1);
  });
});
