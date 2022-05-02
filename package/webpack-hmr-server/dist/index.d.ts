import webpack from 'webpack';
import * as http from 'http';

declare class HotModuleServer {
    private socketServer;
    private putStats;
    constructor(server: http.Server);
    private listenClinets;
    private sendBroadcast;
    private getModuleData;
    processStats(stats?: webpack.Stats | null): void;
    processReload(): void;
}

declare const manual: (serve: http.Server) => HotModuleServer;
declare const _default: (compiler: webpack.Compiler, serve: http.Server) => void;

export { _default as default, manual };
