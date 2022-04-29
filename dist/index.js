'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var stripAnsi = require('strip-ansi');
var url = require('url');
var WebSocket = require('ws');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

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

var stripAnsi__default = /*#__PURE__*/_interopDefaultLegacy(stripAnsi);
var url__namespace = /*#__PURE__*/_interopNamespace(url);
var WebSocket__namespace = /*#__PURE__*/_interopNamespace(WebSocket);

const STATS_CONFIG = {
    all: false,
    cached: true,
    children: true,
    modules: true,
    timings: true,
    hash: true,
    errors: true,
    warnings: true,
};
const hotModuleReplacement = (options) => {
    let lastStat = null;
    const wsServer = new WebSocket__namespace.Server({ noServer: true });
    options.server.on('upgrade', (request, socket, head) => {
        if (!request.url)
            return;
        const pathname = url__namespace.parse(request.url).pathname;
        if (pathname === options.path || !options.path) {
            wsServer.handleUpgrade(request, socket, head, (ws) => {
                wsServer.emit('connection', ws);
            });
            return;
        }
        socket.destroy();
    });
    const sendMessage = (client, action, data) => {
        if (client.readyState === WebSocket__namespace.OPEN) {
            client.send(JSON.stringify({
                action,
                data,
            }));
        }
    };
    const send = (client, action, stats) => {
        if (!stats) {
            sendMessage(client, action);
            return;
        }
        const statsObj = stats.toJson(STATS_CONFIG);
        const errors = statsObj.errors || [];
        const warnings = statsObj.warnings || [];
        sendMessage(client, action, {
            name: statsObj.name || stats.compilation.name || '',
            time: statsObj.time,
            hash: statsObj.hash,
            errors: errors.map((error) => {
                error.message = stripAnsi__default["default"](error.message);
                return error;
            }),
            warnings: warnings.map((warning) => {
                warning.message = stripAnsi__default["default"](warning.message);
                return warning;
            }),
        });
    };
    wsServer.on('connection', (client) => {
        client.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.action === 'check') {
                    send(client, 'check', lastStat);
                }
            }
            catch (e) { }
        });
    });
    const sendStats = function (stats) {
        lastStat = stats;
        wsServer.clients.forEach((client) => {
            send(client, 'build', lastStat);
        });
    };
    return sendStats;
};

const name = '__webpack_hmr_sever__';
const QUERY_PATH = name;
const WEBPACK_PLUGIN_NAME = name;

const webpackHmrServer = (compiler, server) => {
    const sendHmr = hotModuleReplacement({
        server: server,
        path: `/${QUERY_PATH}`,
    });
    compiler.hooks.done.tap(WEBPACK_PLUGIN_NAME, (stats) => {
        sendHmr(stats);
    });
};
module.exports = webpackHmrServer;

exports["default"] = webpackHmrServer;
exports.hotModuleReplacement = hotModuleReplacement;
exports.webpackHmrServer = webpackHmrServer;
//# sourceMappingURL=index.js.map
