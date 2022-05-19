/* eslint-disable filenames/match-regex */
import webpack from 'webpack';
import { ModuleData } from '../../common/types';

export const STATS_CONFIG = {
  all: false,
  cached: true,
  children: true,
  modules: true,
  timings: true,
  hash: true,
  errors: true,
  warnings: true,
};

export const convertStatsToModuleData = (stats?: webpack.Stats | null | undefined): ModuleData | null => {
  if (!stats) {
    return null;
  }

  try {
    const statsJson = stats.toJson(STATS_CONFIG);
    return {
      name: statsJson.name || stats.compilation.name || '',
      hash: statsJson.hash,
      time: statsJson.time,
      warnings: statsJson.warnings || [],
      errors: statsJson.errors || [],
    };
  } catch (error) {
    return null;
  }
};

export const memoStats = (): ((stats?: webpack.Stats | null) => webpack.Stats | null) => {
  let lastStat: webpack.Stats | null = null;

  return function (stats?: webpack.Stats | null) {
    if (stats !== undefined) {
      lastStat = stats;
    }

    return lastStat;
  };
};
