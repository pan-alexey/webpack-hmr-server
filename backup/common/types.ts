import webpack from 'webpack';

export type ServerActions =
  | 'init' // First init client (connect to server and recive ping message)
  | 'check' // If client reconnect, check build hash
  | 'build' // When webpack rebuild
  | 'reload'; // remote pages reload

export interface StatsError extends webpack.StatsError {
  appName?: string;
}

export interface ModuleData {
  hash?: string;
  time?: number;
  warnings: StatsError[];
  errors: StatsError[];
}

export interface Message {
  action: ServerActions;
  data: ModuleData | null;
}

export type Modules = Array<string | number>;

export interface Events {
  message: string;
  serverAction?: ServerActions;
  updatedModules?: Modules;
  stack?: string;
  moduleData: ModuleData | null;
}
