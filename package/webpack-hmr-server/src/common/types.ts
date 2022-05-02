import webpack from 'webpack';

export type ServerActions =
  | 'init' // First init client (connect to server and recive ping message)
  | 'check' // If client reconnect, check build hash
  | 'build' // When webpack rebuild
  | 'reload'; // remote pages reload

export enum ClientActions {}

export interface ModuleData {
  name: string;
  hash?: string;
  time?: number;
  warnings: Array<webpack.StatsError>;
  errors: Array<webpack.StatsError>;
}

export interface Message {
  action: ServerActions;
  data: ModuleData | null;
}

export type Modules = Array<string | number>;

export interface Events {
  message: string;
  serverAction?: ServerActions;
  clinetAction?: ClientActions;
  updatedModules?: Modules;
  stack?: string;
  moduleData: ModuleData | null;
}
