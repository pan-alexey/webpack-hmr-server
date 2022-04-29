// eslint-disable-next-line filenames/match-regex
import webpack from 'webpack';
import { createFsFromVolume, Volume, IFs } from 'memfs';

export default (
  entry?: string,
  mode?: 'production' | 'development',
): {
  compiler: webpack.Compiler;
  fs: IFs;
  volume: InstanceType<typeof Volume>;
} => {
  const volume = new Volume();
  const fs = createFsFromVolume(volume);

  const compiler = webpack({
    entry,
    mode,
    output: {
      filename: 'bundle.js',
      path: '/build',
    },
    performance: {
      hints: 'warning',
      maxEntrypointSize: 20,
      maxAssetSize: 20,
    },
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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
