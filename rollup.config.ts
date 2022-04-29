// eslint-disable-next-line filenames/match-regex
import typescript from '@rollup/plugin-typescript';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

interface BrowserOptions {
  input: string;
  output: string;
  useBabel: boolean;
}

const browser = (options: BrowserOptions) => {
  return {
    input: options.input,
    output: [
      {
        format: 'cjs',
        file: options.output,
      },
    ],
    plugins: [
      resolve({
        browser: true,
      }),
      typescript({
        compilerOptions: {
          noEmitOnError: true,
        },
        include: ['src/client/**/*', '**/*.ts'],
        exclude: ['src/**/*.spec.ts', 'src/**/*.mock.ts'],
      }),
      // use Babel options
      options.useBabel &&
        getBabelOutputPlugin({
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  browsers: 'ie >= 11',
                },
              },
            ],
          ],
        }),
      terser({
        output: {
          comments: false,
        },
        mangle: true,
        compress: true,
      }),
    ].filter(Boolean),
  };
};

export default [
  browser({
    input: './src/client/client.ts',
    output: './client.js',
    useBabel: false,
  }),
  browser({
    input: './src/client/client.legacy.ts',
    output: './client.legacy.js',
    useBabel: true,
  }),
  {
    input: './src/server/index.ts',
    output: [{ file: 'dist/index.d.ts' }],
    plugins: [dts()],
  },
  {
    input: './src/server/index.ts',
    plugins: [
      commonjs({
        exclude: 'node_modules',
        ignoreGlobal: true,
      }),
      // check ts
      typescript({
        compilerOptions: {
          noEmitOnError: true,
        },
        include: ['src/server/**/*', '**/*.ts'],
        exclude: ['src/**/*.spec.ts', 'src/**/*.mock.ts'],
      }),
      terser({
        output: {
          comments: false,
        },
        mangle: true,
        compress: true,
      }),
    ],
    output: [
      {
        format: 'cjs', // commonJS
        sourcemap: true,
        file: 'dist/index.js',
      },
    ],
  },
];
