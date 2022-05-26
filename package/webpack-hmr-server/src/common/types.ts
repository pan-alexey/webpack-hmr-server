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
  | 'refresh'; // remote pages refresh

export interface Data {
  hash?: string;
  time?: number;
  warnings: Array<webpack.StatsError>;
  errors: Array<webpack.StatsError>;
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
  message: EventMessage;
  action: ActionType | 'disconect';
  refresh: boolean;
  state?: BuildState;
  modules?: Modules;
}

// export interface Events {
//   message: string;
//   serverAction?: ServerActions;
//   updatedModules?: Modules;
//   stack?: string;
//   moduleData: ModuleData | null;
// }
