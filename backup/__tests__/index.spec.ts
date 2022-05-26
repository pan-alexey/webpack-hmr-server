/* eslint-disable filenames/match-regex */
import * as http from 'http';
// import WebSocket from 'ws';
import { waitForSocketState, startHttpServer } from '../../../common/__mocks__/fixtures';

import { createHotServer } from '../../index';
import { SocketServer } from '../socket-server';
import { HotReloadServer } from '../hot-reload-server';

describe('server/index', () => {
  it('createHotServer', async () => {
    const httpServer = await startHttpServer();

    const hotServer = createHotServer(httpServer.server);
    expect(hotServer).toBeInstanceOf(HotReloadServer);

    httpServer.close();
  });
});
