/* eslint-disable filenames/match-regex */
import { startHttpServer, createWebSocketServer } from '../__mocks__/fixtures';
import { SocketClient } from '../../components/socket-client';
import ws from 'ws';

describe('client/socket-client', () => {
  beforeAll(async () => {
    // patch global
    Object.assign(global, { WebSocket: ws });
  });

  it('client/connect reconnect close', async () => {
    const openCallback = jest.fn();
    const messageCallback = jest.fn();
    const closeCallback = jest.fn();
    const reconectedCallback = jest.fn();

    let httpServer = await startHttpServer();
    const port = httpServer.port;
    const socketServer = createWebSocketServer(httpServer.server);
    const socketClient = new SocketClient(`ws://127.0.0.1:${port}`, 500);

    socketClient
      .onConnect((client) => {
        openCallback();
        expect(client).toBeInstanceOf(WebSocket);
      })
      .onMessage((data) => {
        messageCallback();
        expect(data).toBe('__message__');
      })
      .onClose(() => {
        closeCallback();
      })
      .onReConnect((client) => {
        reconectedCallback();
        expect(client).toBeInstanceOf(WebSocket);
      });

    // Server scenario
    // ---------------------------------------------------//
    // wait connect
    await new Promise((resolve) => setTimeout(resolve, 100));
    socketServer.clients.forEach((client) => {
      client.send('__message__');
      client.send('__message__');
      client.send('__message__');
    });
    await new Promise((resolve) => setTimeout(resolve, 100));

    // close an up server (emulate loss connection)
    await httpServer.close(); // close all connections
    await new Promise((resolve) => setTimeout(resolve, 3_000)); // wait close;
    httpServer = await startHttpServer(port);
    createWebSocketServer(httpServer.server);
    await new Promise((resolve) => setTimeout(resolve, 2_000));

    // close an up server (emulate loss connection)
    await httpServer.close(); // close all connections
    await new Promise((resolve) => setTimeout(resolve, 3_000)); // wait close;
    httpServer = await startHttpServer(port);
    createWebSocketServer(httpServer.server);
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    // ---------------------------------------------------//

    socketClient.close();
    await httpServer.close();
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(openCallback.mock.calls.length).toEqual(1);
    expect(messageCallback.mock.calls.length).toEqual(3);
    expect(reconectedCallback.mock.calls.length).toEqual(2);
    expect(closeCallback.mock.calls.length > 10).toBe(true);
  });
});
