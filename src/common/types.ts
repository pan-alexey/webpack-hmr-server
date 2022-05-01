import webpack from 'webpack';

export type Actions = 'init' | 'check' | 'build' | 'reload';

export interface ModuleData {
  name: string;
  hash?: string;
  time?: number;
  warnings: Array<webpack.StatsError>;
  errors: Array<webpack.StatsError>;
}

export interface Message {
  action: Actions;
  info?: string;
  data: ModuleData | null;
}
