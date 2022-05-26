import * as http from 'http';
import * as net from 'net';
import WebSocket from 'ws';

export function createWebSocketServer(server: http.Server): WebSocket.Server {
  const wss = new WebSocket.Server({ server });
  return wss;
}

export function waitForSocketState(
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

export const createHttpServer = (port?: number): Promise<http.Server> => {
  const server = http.createServer();
  return new Promise((resolve) => {
    if (port) {
      server.listen(port, () => resolve(server));
    } else {
      server.listen(() => resolve(server));
    }
  });
};

export const startHttpServer = async (
  port?: number,
): Promise<{
  server: http.Server;
  port: number;
  close: () => Promise<unknown>;
}> => {
  const server = await createHttpServer(port);
  const sockets = new Set<net.Socket>();

  server.on('connection', (socket) => {
    sockets.add(socket);

    server.once('close', () => {
      sockets.delete(socket);
    });
  });

  // close all open socket
  const close = () =>
    new Promise((resolve) => {
      for (const socket of sockets) {
        socket.destroy();
        sockets.delete(socket);
      }
      server.close(() => resolve(null));
    });

  return {
    server,
    port: (server.address() as net.AddressInfo).port,
    close,
  };
};
