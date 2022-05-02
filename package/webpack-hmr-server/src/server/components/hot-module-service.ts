/* eslint-disable filenames/match-regex */
import webpack from 'webpack';
import * as http from 'http';
import { SocketServer } from './socket-server';
import { memoStats, convertStatsToModuleData } from './webpack-sats';
import { SERVER_PATH_NAME } from '../../common/constants';
import { ServerActions, ModuleData, Message } from '../../common/types';

export const processMessage = (action: ServerActions, data: ModuleData | null): string => {
  const message: Message = {
    action,
    data,
  };
  return JSON.stringify(message);
};

export class HotModuleServer {
  private socketServer: SocketServer;
  private putStats = memoStats();

  constructor(server: http.Server) {
    this.socketServer = new SocketServer({
      server,
      path: SERVER_PATH_NAME,
    });
    this.listenClinets();
  }

  private listenClinets(): void {
    this.socketServer.onMessage((message, reply) => {
      // pong server message;
      switch (message) {
        case 'init':
        case 'check':
          reply(processMessage(message, this.getModuleData()));
          break;
      }
    });
  }

  private sendBroadcast(action: ServerActions, data: ModuleData | null): void {
    const message = processMessage(action, data);
    this.socketServer.sendBroadcast(message);
  }

  private getModuleData(stats?: webpack.Stats | null): ModuleData | null {
    const currentStats = this.putStats(stats);
    return convertStatsToModuleData(currentStats);
  }

  // reload modules
  public processStats(stats?: webpack.Stats | null) {
    this.sendBroadcast('build', this.getModuleData(stats));
  }

  // reload page to all client
  public processReload() {
    this.sendBroadcast('reload', null);
  }
}
