import * as http from "http";
import * as net from "net";

export const createHttpServer = (
  listener?: http.RequestListener
): Promise<http.Server> => {
  const server = http.createServer(listener);
  return new Promise((resolve) => {
    server.listen(() => resolve(server));
  });
};

export const startHttpServer = async (
  listener?: http.RequestListener
): Promise<{
  server: http.Server;
  port: number;
  close: () => Promise<unknown>;
}> => {
  const server = await createHttpServer(listener);
  const sockets = new Set<net.Socket>();

  server.on("connection", (socket) => {
    sockets.add(socket);

    server.once("close", () => {
      sockets.delete(socket);
    });
  });

  // close all open socket (WebSocket)
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
