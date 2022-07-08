import * as http from 'http';
import webpack from 'webpack';

declare type Stats = webpack.Stats;
declare type StatsError = webpack.StatsError;
declare type General<T> = {
    client: T;
    server?: T;
};
declare type ActionType = 'init' | 'check' | 'build' | 'refresh' | 'disconect';
interface DataStatsError extends webpack.StatsError {
    _name_: string;
    _hash_: string;
}
interface Data {
    hash?: string;
    time?: number;
    warnings: Array<DataStatsError>;
    errors: Array<DataStatsError>;
}
declare type BuildState = General<Data>;
declare type BuildStats = General<Stats>;
interface Message {
    action: ActionType;
    state?: BuildState;
}
declare type Modules = Array<string | number>;
declare type EventMessage = 'unknown' | 'Remote refresh' | 'Not valid state' | 'Hot module reload disable' | 'Update failed' | 'Already update' | 'Modules updated' | 'Build with error' | 'Disconect';
interface Event {
    resourceQuery: string;
    message: EventMessage;
    hotEnable: boolean;
    action: ActionType;
    refresh: boolean;
    state?: BuildState;
    modules?: Modules;
}

type types_Stats = Stats;
type types_StatsError = StatsError;
type types_General<T> = General<T>;
type types_ActionType = ActionType;
type types_DataStatsError = DataStatsError;
type types_Data = Data;
type types_BuildState = BuildState;
type types_BuildStats = BuildStats;
type types_Message = Message;
type types_Modules = Modules;
type types_EventMessage = EventMessage;
type types_Event = Event;
declare namespace types {
  export {
    types_Stats as Stats,
    types_StatsError as StatsError,
    types_General as General,
    types_ActionType as ActionType,
    types_DataStatsError as DataStatsError,
    types_Data as Data,
    types_BuildState as BuildState,
    types_BuildStats as BuildStats,
    types_Message as Message,
    types_Modules as Modules,
    types_EventMessage as EventMessage,
    types_Event as Event,
  };
}

declare class HotReloadServer {
    private state;
    private socketServer;
    constructor(server: http.Server);
    private answerResponse;
    private sendBroadcast;
    reloadModules(buildStats: BuildStats): void;
    refresh: () => void;
}

declare const auto: (compiler: webpack.Compiler, server: http.Server) => {
    refresh: () => void;
};

declare const createHotServer: (server: http.Server) => HotReloadServer;

export { types as Types, createHotServer, auto as default };
