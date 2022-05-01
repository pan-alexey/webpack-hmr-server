import * as http from 'http';
import * as net from 'net';
import WebSocket from 'ws';

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

export const createHttpServer = (): Promise<http.Server> => {
  const server = http.createServer();
  return new Promise((resolve) => {
    server.listen(() => resolve(server));
  });
};

export const startHttpServer = async (): Promise<{
  server: http.Server;
  port: number;
}> => {
  const server = await createHttpServer();
  const port = (server.address() as net.AddressInfo).port;

  return {
    server,
    port,
  };
};
