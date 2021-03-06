import webpack from 'webpack';

export type Stats = webpack.Stats;
export type StatsError = webpack.StatsError;

export type General<T> = {
  client: T;
  server?: T;
};

export type ActionType =
  | 'init' // First init client (connect to server and recive ping message)
  | 'check' // If client reconnect, check build hash
  | 'build' // When webpack rebuild
  | 'refresh' // remote pages refresh
  | 'disconect';

export interface DataStatsError extends webpack.StatsError {
  _name_: string; // ( moduleName + location ) || First line string
  _hash_: string; // moduleName + location
}

export interface Data {
  hash?: string;
  time?: number;
  warnings: Array<DataStatsError>;
  errors: Array<DataStatsError>;
}

export type BuildState = General<Data>;
export type BuildStats = General<Stats>;

export interface Message {
  action: ActionType;
  state?: BuildState;
}

export type Modules = Array<string | number>;

export type EventMessage =
  | 'unknown'
  | 'Remote refresh'
  | 'Not valid state'
  | 'Hot module reload disable'
  | 'Update failed'
  | 'Already update'
  | 'Modules updated'
  | 'Build with error'
  | 'Disconect';

export interface Event {
  resourceQuery: string;
  message: EventMessage;
  hotEnable: boolean;
  action: ActionType;
  refresh: boolean;
  state?: BuildState;
  modules?: Modules;
}
