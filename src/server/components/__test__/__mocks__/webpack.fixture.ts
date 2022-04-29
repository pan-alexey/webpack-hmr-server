// eslint-disable-next-line filenames/match-regex
import webpack, { web } from 'webpack';
import { createFsFromVolume, Volume, IFs } from 'memfs';

export default (
  entry?: string,
  mode?: 'production' | 'development',
  performance?: {
    hints?: false | 'error' | 'warning';
    maxAssetSize?: number;
    maxEntrypointSize?: number;
  },
): {
  compiler: webpack.Compiler;
  fs: IFs;
  volume: InstanceType<typeof Volume>;
} => {
  const volume = new Volume();
  const fs = createFsFromVolume(volume);

  const webpackConfig: webpack.Configuration = {
    entry,
    mode,
    output: {
      filename: 'bundle.js',
      path: '/build',
    },
  };

  if (performance) {
    webpackConfig.performance = performance;
  }

  const compiler = webpack(webpackConfig);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  compiler.outputFileSystem = createFsFromVolume(volume);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  compiler.inputFileSystem = createFsFromVolume(volume);

  return {
    compiler,
    fs,
    volume,
  };
};
