import webpack from 'webpack';
import * as http from 'http';
import { WEBPACK_PLUGIN_NAME } from '../common/constants';
import { HotModuleServer } from './components/hot-module-service';

export { HotModuleServer };

export const manual = (serve: http.Server) => {
  return new HotModuleServer(serve);
};

export default (compiler: webpack.Compiler, serve: http.Server) => {
  const hotModuleServer = new HotModuleServer(serve);

  compiler.hooks.done.tap(WEBPACK_PLUGIN_NAME, (stats: webpack.Stats) => {
    hotModuleServer.processStats(stats);
  });
};
