/* eslint-disable filenames/match-regex */
import webpack from 'webpack';
import webpackFixture from 'webpack-fixture';

import { memoStats, convertStatsToModuleData } from '../../components/webpack-sats';

const webpackConfig: webpack.Configuration = {
  entry: '/index.js',
  mode: 'production',
  output: {
    filename: 'bundle.js',
    path: '/build',
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 20,
    maxAssetSize: 20,
  },
};

describe('server/WebpackStats', () => {
  it('memoStats', async () => {
    const processStats = memoStats();
    // first call
    expect(processStats()).toBeNull();
    expect(processStats()).toBeNull();

    const mockWebpackStats1 = {} as webpack.Stats;

    expect(processStats(mockWebpackStats1)).toBe(mockWebpackStats1);
    expect(processStats()).toBe(mockWebpackStats1);

    expect(processStats(null)).not.toBe(mockWebpackStats1);
    expect(processStats()).toBeNull();
  });

  it('convertStatsToModuleData', async () => {
    expect(convertStatsToModuleData()).toBeNull();
    expect(convertStatsToModuleData(null)).toBeNull();

    const notValidStats = {} as unknown as webpack.Stats;
    expect(convertStatsToModuleData(notValidStats)).toBeNull();

    // webpack compile to memfs
    const { compiler, fs } = webpackFixture(webpackConfig);

    // Success compile
    fs.writeFileSync('/index.js', `const text='test'; console.log(text)`);
    const compileOk = await new Promise((resolve) => {
      compiler.run((err, stats) => {
        resolve(stats);
      });
    });

    const moduleDataOk = convertStatsToModuleData(compileOk as webpack.Stats);
    expect(moduleDataOk).toStrictEqual({
      name: expect.any(String),
      hash: (compileOk as webpack.Stats).hash,
      time: expect.any(Number),
      warnings: expect.any(Array),
      errors: expect.any(Array),
    });
    if (moduleDataOk) {
      expect(moduleDataOk.warnings.length).toBe(0);
      expect(moduleDataOk.errors.length).toBe(0);
    }

    // Warning compile (performance.hints = warnings)
    let bigCode = '';
    for (let i = 0; i < 100_000; i++) {
      bigCode = 'console.log(child_process);console.log(child_process);console.log(child_process);';
    }
    fs.writeFileSync('/index.js', bigCode);
    const compileWarning = await new Promise((resolve) => {
      compiler.run((err, stats) => {
        resolve(stats);
      });
    });

    const moduleDataWarning = convertStatsToModuleData(compileWarning as webpack.Stats);
    expect(moduleDataWarning).toStrictEqual({
      name: expect.any(String),
      hash: (compileWarning as webpack.Stats).hash,
      time: expect.any(Number),
      warnings: expect.any(Array),
      errors: expect.any(Array),
    });
    if (moduleDataWarning) {
      expect(moduleDataWarning.warnings.length > 0).toBe(true);
      expect(moduleDataWarning.errors.length === 0).toBe(true);
    }

    // Error compile
    fs.writeFileSync('/index.js', 'console.log(');
    const compileError = await new Promise((resolve) => {
      compiler.run((err, stats) => {
        resolve(stats);
      });
    });

    const moduleDataError = convertStatsToModuleData(compileError as webpack.Stats);
    expect(moduleDataError).toStrictEqual({
      name: expect.any(String),
      hash: (compileError as webpack.Stats).hash,
      time: expect.any(Number),
      warnings: expect.any(Array),
      errors: expect.any(Array),
    });
    if (moduleDataError) {
      expect(moduleDataError.warnings.length === 0).toBe(true);
      expect(moduleDataError.errors.length > 0).toBe(true);
    }
  });
});
