import webpack from 'webpack';
import * as http from 'http';
import { hotModuleReplacement } from './socket';
import { WEBPACK_PLUGIN_NAME, QUERY_PATH } from '../common/constants';

export { hotModuleReplacement };

export const webpackHmrServer = (compiler: webpack.Compiler, server: http.Server) => {
  const sendHmr = hotModuleReplacement({
    server: server,
    path: `/${QUERY_PATH}`,
  });
  compiler.hooks.done.tap(WEBPACK_PLUGIN_NAME, (stats: webpack.Stats) => {
    sendHmr(stats);
  });
};

export default webpackHmrServer;
module.exports = webpackHmrServer;
