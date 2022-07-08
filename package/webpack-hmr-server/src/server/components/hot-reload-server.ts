/* eslint-disable filenames/match-regex */

import * as http from 'http';
import * as crypto from 'crypto';
import { SocketServer } from './socket-server';
import { SERVER_PATH_NAME, STATS_CONFIG } from '../../common/constants';
import { ActionType, Data, Stats, BuildState, BuildStats, DataStatsError } from '../../common/types';
import webpack from 'webpack';

export const processMessage = (action: ActionType, state?: BuildState): string => {
  return JSON.stringify({
    action,
    state,
  });
};

export const getErrorName = (error: webpack.StatsError): string => {
  const moduleName = error.moduleName || error.file;
  if (moduleName) {
    const loc = error.loc ? `:${parseInt(error.loc)}` : '';
    return `${moduleName}${loc}`;
  }

  return error.message.split('\n')[0];
};

export const md5 = (input: string): string => {
  return crypto.createHash('md5').update(input).digest('hex');
};

export const convertError = (statsError: webpack.StatsError): DataStatsError => {
  const _name_ = getErrorName(statsError);
  const _hash_ = md5(_name_) + '.' + md5(statsError.message);
  return {
    _name_,
    _hash_,
    ...statsError,
  };
};

export const statsToData = (stats?: Stats): Data | undefined => {
  if (!stats) return stats;

  /* istanbul ignore next */ // dont need test destructuring
  const { hash, time, warnings = [], errors = [] } = stats.toJson(STATS_CONFIG);

  return {
    hash,
    time,
    warnings: warnings.map(convertError),
    errors: errors.map(convertError),
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
