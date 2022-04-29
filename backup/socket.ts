import webpack from 'webpack';
import stripAnsi from 'strip-ansi';
import * as url from 'url';
import * as http from 'http';
import * as WebSocket from 'ws';

export interface Options {
  server: http.Server;
  path?: string;
}

export interface HotModuleMessage {
  action: 'check' | 'build';
  stats: webpack.Stats | null;
}

export interface ModuleData {
  name: string;
  hash?: string;
  time?: number;
  warnings: Array<webpack.StatsError>;
  errors: Array<webpack.StatsError>;
}

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

export const WebSocketServer = (options: Options) => {
  let lastStat: webpack.Stats | null = null;

  const wsServer = new WebSocket.Server({ noServer: true });
  options.server.on('upgrade', (request, socket, head) => {
    if (!request.url) return;
    const pathname = url.parse(request.url).pathname;
    if (pathname === options.path || !options.path) {
      wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit('connection', ws);
      });
      return;
    }
    socket.destroy();
  });

  const sendMessage = (client: WebSocket.WebSocket, action: 'check' | 'build', data?: ModuleData): void => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          action,
          data,
        }),
      );
    }
  };

  const send = (client: WebSocket.WebSocket, action: 'check' | 'build', stats: webpack.Stats | null): void => {
    if (!stats) {
      sendMessage(client, action);
      return;
    }

    const statsObj = stats.toJson(STATS_CONFIG);

    const errors: Array<webpack.StatsError> = statsObj.errors || [];
    const warnings: Array<webpack.StatsError> = statsObj.warnings || [];

    sendMessage(client, action, {
      name: statsObj.name || stats.compilation.name || '',
      time: statsObj.time,
      hash: statsObj.hash,
      errors: errors.map((error) => {
        error.message = stripAnsi(error.message);
        return error;
      }),
      warnings: warnings.map((warning) => {
        warning.message = stripAnsi(warning.message);
        return warning;
      }),
    });
  };

  // Synchronize stats when socket start
  wsServer.on('connection', (client) => {
    client.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.action === 'check') {
          send(client, 'check', lastStat);
        }
        // eslint-disable-next-line no-empty
      } catch (e) {}
    });
  });

  const sendStats = function (stats: webpack.Stats | null) {
    lastStat = stats;

    // broadcast messages
    wsServer.clients.forEach((client) => {
      send(client, 'build', lastStat);
    });
  };

  return sendStats;
};
