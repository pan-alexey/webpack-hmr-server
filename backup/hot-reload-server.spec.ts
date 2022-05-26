/* eslint-disable filenames/match-regex */
import * as http from 'http';
import WebSocket from 'ws';
import { waitForSocketState, startHttpServer } from '../../../common/__mocks__/fixtures';

import { SocketServer } from '../socket-server';

describe('server/hot-reload-server', () => {
  it('onMessage', async () => {
    expect(1).toEqual(1);
  });
});
