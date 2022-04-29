'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var url = require('url');
var WebSocket = require('ws');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var url__namespace = /*#__PURE__*/_interopNamespace(url);
var WebSocket__namespace = /*#__PURE__*/_interopNamespace(WebSocket);

class SocketServer {
    wsServer;
    httpServer;
    path;
    callbacks = [];
    constructor(options) {
        this.path = `/${options.path || ''}`;
        this.httpServer = options.server;
        this.wsServer = new WebSocket__namespace.Server({ noServer: true });
        this.setupWsServer();
        this.setupListenersClient();
    }
    setupWsServer() {
        this.httpServer.on('upgrade', (request, socket, head) => {
            if (!request.url) {
                socket.destroy();
                return;
            }
            const pathname = url__namespace.parse(request.url).pathname || '/';
            if (pathname === this.path) {
                this.wsServer.handleUpgrade(request, socket, head, (ws) => {
                    this.wsServer.emit('connection', ws);
                });
                return;
            }
        });
    }
    setupListenersClient() {
        this.wsServer.on('connection', (client) => {
            client.on('message', (message) => {
                this.callbacks.forEach((callback) => {
                    const reply = (message) => {
                        this.sendMessage(client, message);
                    };
                    callback(message.toString(), reply);
                });
            });
        });
    }
    sendMessage(client, message) {
        if (client.readyState === WebSocket__namespace.OPEN) {
            client.send(message);
        }
    }
    sendBroadcast(message) {
        this.wsServer.clients.forEach((client) => {
            this.sendMessage(client, message);
        });
    }
    onMessage(callback) {
        this.callbacks.push(callback);
    }
}

exports.SocketServer = SocketServer;
//# sourceMappingURL=index.js.map
