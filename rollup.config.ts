// eslint-disable-next-line filenames/match-regex
import typescript from '@rollup/plugin-typescript';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
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
  // {
  //   input: "./src/client/index.ts",
  //   plugins: [
  //     resolve({
  //       browser: true,
  //     }),
  //     // check ts
  //     typescript({
  //       compilerOptions: {
  //         noEmitOnError: true,
  //       },
  //       include: ["src/client/**/*", "**/*.ts"],
  //     }),
  //     getBabelOutputPlugin({
  //       presets: [
  //         [
  //           "@babel/preset-env",
  //           {
  //             targets: {
  //               browsers: "ie >= 11",
  //             },
  //           },
  //         ],
  //       ],
  //     }),
  //     terser({
  //       output: {
  //         comments: false,
  //       },
  //       mangle: true,
  //       compress: true,
  //     }),
  //   ],
  //   output: [
  //     {
  //       format: "cjs",
  //       file: "build/client/index.js",
  //     },
  //   ],
  // },
];
