/* eslint-disable filenames/match-regex */
import * as url from 'url';
import * as http from 'http';
import * as WebSocket from 'ws';

export interface SocketServerOptions {
  server: http.Server;
  path?: string;
}

type MessageReply = (message: string) => void;
type MessageCallback = (message: string, reply: MessageReply) => void;

export class SocketServer {
  private wsServer: WebSocket.Server;
  private httpServer: http.Server;
  private path: string | undefined;
  private callbacks: Array<MessageCallback> = [];

  constructor(options: SocketServerOptions) {
    this.path = `/${options.path || ''}`;
    this.httpServer = options.server;
    this.wsServer = new WebSocket.Server({ noServer: true });
    this.setupWsServer();
    this.setupListenersClient();
  }

  private setupWsServer() {
    this.httpServer.on('upgrade', (request, socket, head) => {
      // Dont know how to handle this case
      if (!request.url) {
        return;
      }

      // register ws server only pathname;
      const pathname = url.parse(request.url).pathname;
      // if options.pathname not set or request is mathc
      if (pathname === this.path) {
        this.wsServer.handleUpgrade(request, socket, head, (ws) => {
          this.wsServer.emit('connection', ws);
        });
        return;
      }
    });
  }

  private setupListenersClient() {
    this.wsServer.on('connection', (client: WebSocket.WebSocket) => {
      client.on('message', (message: string) => {
        this.callbacks.forEach((callback) => {
          const reply: MessageReply = (message: string) => {
            this.sendMessage(client, message);
          };
          callback(message.toString(), reply);
        });
      });
    });
  }

  private sendMessage(client: WebSocket.WebSocket, message: string): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }

  public sendBroadcast(message: string): void {
    this.wsServer.clients.forEach((client) => {
      this.sendMessage(client, message);
    });
  }

  public onMessage(callback: MessageCallback) {
    this.callbacks.push(callback);
  }
}
