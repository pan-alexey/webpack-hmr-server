import webpack from 'webpack';
import * as http from 'http';

interface Options {
    server: http.Server;
    path?: string;
}
declare const hotModuleReplacement: (options: Options) => (stats: webpack.Stats | null) => void;

declare const webpackHmrServer: (compiler: webpack.Compiler, server: http.Server) => void;

export { webpackHmrServer as default, hotModuleReplacement, webpackHmrServer };
