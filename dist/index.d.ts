import * as http from 'http';

interface SocketServerOptions {
    server: http.Server;
    path?: string;
}
declare type MessageReply = (message: string) => void;
declare type MessageCallback = (message: string, reply: MessageReply) => void;
declare class SocketServer {
    private wsServer;
    private httpServer;
    private path;
    private callbacks;
    constructor(options: SocketServerOptions);
    private setupWsServer;
    private setupListenersClient;
    private sendMessage;
    sendBroadcast(message: string): void;
    onMessage(callback: MessageCallback): void;
}

export { SocketServer };
