import * as http from 'http';
import { WEBPACK_PLUGIN_NAME } from '../common/constants';
import { HotReloadServer } from './components/hot-reload-server';
import webpack from 'webpack';
import * as Types from '../common/types';
export { Types };

export { statsToData } from './components/hot-reload-server';

// factory HotReloadServer
export const createHotServer = (server: http.Server): HotReloadServer => {
  return new HotReloadServer(server);
};

export default (compiler: webpack.Compiler /* client compiler*/, server: http.Server): { refresh: () => void } => {
  const hotServer = new HotReloadServer(server);
  compiler.hooks.done.tap(WEBPACK_PLUGIN_NAME, (stats: webpack.Stats) => {
    hotServer.reloadModules({
      client: stats,
    });
  });

  return {
    refresh: hotServer.refresh,
  };
};
