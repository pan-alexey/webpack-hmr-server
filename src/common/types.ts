import webpack from 'webpack';

export type Actions = 'check' | 'build' | 'reload';
export type Events = '';

export interface ModuleData {
  name: string;
  hash?: string;
  time?: number;
  warnings: Array<webpack.StatsError>;
  errors: Array<webpack.StatsError>;
}
