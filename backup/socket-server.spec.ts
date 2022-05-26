/* eslint-disable filenames/match-regex */
import * as http from 'http';
import WebSocket from 'ws';
import { waitForSocketState, startHttpServer } from '../src/common/__mocks__/fixtures';

import { SocketServer } from '../src/server/components/socket-server';

describe('server/socket-server', () => {
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

  it('root path', async () => {
    new SocketServer({ server: httpServer.server });
    const socketClient = new WebSocket(`ws://localhost:${httpServer.port}`);
    await waitForSocketState(socketClient, WebSocket.OPEN);

    socketClient.close();
    await waitForSocketState(socketClient, WebSocket.CLOSED);
  });

  it('broadcast', async () => {
    const mockCallback1 = jest.fn();
    const mockCallback2 = jest.fn();
    const mockCallback3 = jest.fn();

    const path = '__ws_test_broadcast__';
    const sentMessage = Math.random().toString(36).substring(7);

    const socketServer = new SocketServer({ server: httpServer.server, path });
    const socketClient1 = new WebSocket(`ws://localhost:${httpServer.port}/${path}`);
    const socketClient2 = new WebSocket(`ws://localhost:${httpServer.port}/${path}`);
    const socketClient3 = new WebSocket(`ws://localhost:${httpServer.port}/${path}`);
    await waitForSocketState(socketClient1, WebSocket.OPEN);
    await waitForSocketState(socketClient2, WebSocket.OPEN);
    await waitForSocketState(socketClient3, WebSocket.OPEN);

    socketClient1.on('message', (data) => {
      mockCallback1();
      const message = data.toString();
      expect(message).toEqual(sentMessage);
      socketClient1.close();
    });
    socketClient2.on('message', (data) => {
      mockCallback2();
      const message = data.toString();
      expect(message).toEqual(sentMessage);
      socketClient2.close();
    });
    socketClient3.on('message', (data) => {
      mockCallback3();
      const message = data.toString();
      expect(message).toEqual(sentMessage);
      socketClient3.close();
    });

    socketServer.sendBroadcast(sentMessage);
    await waitForSocketState(socketClient1, WebSocket.CLOSED);
    await waitForSocketState(socketClient2, WebSocket.CLOSED);
    await waitForSocketState(socketClient3, WebSocket.CLOSED);

    expect(mockCallback1.mock.calls.length).toEqual(1);
    expect(mockCallback2.mock.calls.length).toEqual(1);
    expect(mockCallback3.mock.calls.length).toEqual(1);
  });

  it('onMessage', async () => {
    const mockServerCallback = jest.fn();

    const mockClientCallback1 = jest.fn();
    const mockClientCallback2 = jest.fn();
    const mockClientCallback3 = jest.fn();

    const path = '__ws_test_onMessage__';

    const socketServer = new SocketServer({ server: httpServer.server, path });
    const socketClient1 = new WebSocket(`ws://localhost:${httpServer.port}/${path}`);
    const socketClient2 = new WebSocket(`ws://localhost:${httpServer.port}/${path}`);
    const socketClient3 = new WebSocket(`ws://localhost:${httpServer.port}/${path}`);
    await waitForSocketState(socketClient1, WebSocket.OPEN);
    await waitForSocketState(socketClient2, WebSocket.OPEN);
    await waitForSocketState(socketClient3, WebSocket.OPEN);

    socketClient1.on('message', (data) => {
      mockClientCallback1();
      const message = data.toString();
      expect(message).toEqual(`reply>socketClient1`);
      socketClient1.close();
    });

    socketClient2.on('message', (data) => {
      mockClientCallback2();
      const message = data.toString();
      expect(message).toEqual(`reply>socketClient2`);
      socketClient2.close();
    });

    socketClient3.on('message', (data) => {
      mockClientCallback3();
      const message = data.toString();
      expect(message).toEqual(`reply>socketClient3`);
      socketClient3.close();
    });

    // ping test
    socketServer.onMessage((reciveMessage, reply) => {
      mockServerCallback(); // 3 calls
      reply(`reply>${reciveMessage}`);
    });

    socketClient1.send(`socketClient1`);
    socketClient2.send(`socketClient2`);
    socketClient3.send(`socketClient3`);

    await waitForSocketState(socketClient1, WebSocket.CLOSED);
    await waitForSocketState(socketClient2, WebSocket.CLOSED);
    await waitForSocketState(socketClient3, WebSocket.CLOSED);

    expect(mockServerCallback.mock.calls.length).toEqual(3);

    expect(mockClientCallback1.mock.calls.length).toEqual(1);
    expect(mockClientCallback2.mock.calls.length).toEqual(1);
    expect(mockClientCallback3.mock.calls.length).toEqual(1);
  });
});
