/* eslint-disable filenames/match-regex */

import * as http from 'http';
import { SocketServer } from './socket-server';
import { SERVER_PATH_NAME, STATS_CONFIG } from '../../common/constants';
import { ActionType, Data, Stats, BuildState, BuildStats } from '../../common/types';

export const processMessage = (action: ActionType, state?: BuildState): string => {
  return JSON.stringify({
    action,
    state,
  });
};

export const statsToData = (stats?: Stats): Data | undefined => {
  if (!stats) return stats;

  /* istanbul ignore next */ // dont need test destructuring
  const { hash, time, warnings = [], errors = [] } = stats.toJson(STATS_CONFIG);
  return {
    hash,
    time,
    warnings,
    errors,
  };
};

export const buildStatsToState = (buildStats: BuildStats): BuildState => {
  type keys = keyof typeof buildStats;
  const state: Partial<BuildState> = {};

  (Object.keys(buildStats) as keys[]).forEach((key) => {
    state[key] = statsToData(buildStats[key]);
  });
  return state as BuildState;
};

export class HotReloadServer {
  private state: BuildState | undefined = undefined;
  private socketServer: SocketServer;
  constructor(server: http.Server) {
    this.socketServer = new SocketServer({
      server,
      path: SERVER_PATH_NAME,
    });

    this.answerResponse();
  }

  private answerResponse(): void {
    this.socketServer.onMessage((message, reply) => {
      // send last state for actions
      switch (message) {
        case 'init':
        case 'check':
          reply(processMessage(message, this.state));
          break;
      }
    });
  }

  private sendBroadcast(action: ActionType, state?: BuildState): void {
    const message = processMessage(action, state);
    this.socketServer.sendBroadcast(message);
  }

  // reload modules
  public reloadModules(buildStats: BuildStats) {
    const state: BuildState = buildStatsToState(buildStats);
    this.state = state;
    this.sendBroadcast('build', state);
  }

  public refresh = () => {
    this.sendBroadcast('refresh');
  };
}
