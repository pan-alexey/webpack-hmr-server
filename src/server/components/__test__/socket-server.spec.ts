/* eslint-disable filenames/match-regex */
import * as http from 'http';
import * as net from 'net';
import WebSocket from 'ws';

import { SocketServer } from '../socket-server';

function startServer(): Promise<http.Server> {
  const server = http.createServer();
  return new Promise((resolve) => {
    server.listen(() => resolve(server));
  });
}

function waitForSocketState(
  socketClient: WebSocket.WebSocket,
  status: typeof WebSocket.OPEN | typeof WebSocket.CLOSED,
) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      if (socketClient.readyState === status) {
        resolve(true);
      } else {
        waitForSocketState(socketClient, status).then(resolve);
      }
    }, 10);
  });
}

describe('WebSocketServer', () => {
  let httpServer: http.Server;
  let httpServerPrort: number;

  beforeAll(async () => {
    httpServer = await startServer();
    httpServerPrort = (httpServer.address() as net.AddressInfo).port;
  });

  afterAll(() => {
    httpServer.close();
  });

  it('root path', async () => {
    const socketServer = new SocketServer({ server: httpServer });
    // const socketClient1 = new WebSocket(`ws://localhost:${httpServerPrort}/`);
    const socketClient2 = new WebSocket(`ws://localhost:${httpServerPrort}`);
    // await waitForSocketState(socketClient1, WebSocket.OPEN);
    await waitForSocketState(socketClient2, WebSocket.OPEN);

    // socketClient1.close();
    socketClient2.close();
    // await waitForSocketState(socketClient1, WebSocket.CLOSED);
    await waitForSocketState(socketClient2, WebSocket.CLOSED);
  });

  it('broadcast', async () => {
    const mockCallback1 = jest.fn();
    const mockCallback2 = jest.fn();
    const mockCallback3 = jest.fn();

    const path = '__ws_test_broadcast__';
    const sentMessage = Math.random().toString(36).substring(7);

    const socketServer = new SocketServer({ server: httpServer, path });
    const socketClient1 = new WebSocket(`ws://localhost:${httpServerPrort}/${path}`);
    const socketClient2 = new WebSocket(`ws://localhost:${httpServerPrort}/${path}`);
    const socketClient3 = new WebSocket(`ws://localhost:${httpServerPrort}/${path}`);
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

    const socketServer = new SocketServer({ server: httpServer, path });
    const socketClient1 = new WebSocket(`ws://localhost:${httpServerPrort}/${path}`);
    const socketClient2 = new WebSocket(`ws://localhost:${httpServerPrort}/${path}`);
    const socketClient3 = new WebSocket(`ws://localhost:${httpServerPrort}/${path}`);
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
