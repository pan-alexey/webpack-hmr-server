import crypto from "crypto";
import puppeteer from "puppeteer";
import webpack from "webpack";
import express from "express";
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

import webpackHmrServer from "webpack-hmr-server";
import path from "path";
import fse from "fs-extra";

import { startHttpServer } from "./__mocks__/fixtrures";

describe("e2e/react", () => {
  let browser: puppeteer.Browser;
  let files: Record<string, string>;
  beforeAll(async () => {
    browser = await puppeteer.launch({
      // headless: false,
      devtools: true,
    });
  });

  afterAll(async () => {
    await browser.close();
  });
  // --------------------------------------------------------------------------------//
  it("client/reload(without plugin)", async () => {
    const app = express();
    const httpServer = await startHttpServer(app);

    // create cache directory
    const random = crypto.randomUUID();
    const publicPath = path.resolve(process.cwd(), "./.cache", random);
    fse.removeSync(publicPath);
    fse.copySync(path.resolve(process.cwd(), "public"), publicPath);
    app.use(express.static(publicPath));

    // webpack settings
    const webpackConfig: webpack.Configuration = {
      entry: [
        path.resolve(publicPath, "./index.tsx"),
        require.resolve("webpack-hmr-server/client.legacy.js"), // "webpack-hmr-server/client.js",
      ],
      // context:
      target: "web",
      devtool: "source-map",
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: "babel-loader",
                options: {
                  presets: ["@babel/preset-env", "@babel/preset-react"],
                  plugins: [
                    "@babel/plugin-proposal-class-properties",
                    ["react-refresh/babel", { skipEnvCheck: true }],
                  ],
                },
              },
            ],
          },
          {
            test: /\.(ts|tsx)$/,
            exclude: /node_modules/,
            use: ["ts-loader"],
          },
        ],
      },
      mode: "development",
      resolve: {
        extensions: [".js", ".ts", ".tsx"],
      },
      output: {
        filename: "index.js",
        path: path.resolve(publicPath, "./build"),
      },
      plugins: [
        new ReactRefreshWebpackPlugin({}),
        // new webpack.HotModuleReplacementPlugin({}),
      ],
    };

    const compiler = webpack(webpackConfig);
    webpackHmrServer(compiler, httpServer.server);
    compiler.watch(
      {
        aggregateTimeout: 10,
        poll: 10,
      },
      (err, stats) => {}
    );
    // wait build
    await new Promise((reolve) => setTimeout(reolve, 5_000));
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${httpServer.port}/index.html`);
    await new Promise((reolve) => setTimeout(reolve, 5_000)); // recomendet delay

    // // Scenarion:
    // // *****************************************************
    let element1 = "";
    let element2 = "";

    element1 = await page.$eval(
      "#element-1",
      (element) => element.textContent || ""
    );
    element2 = await page.$eval(
      "#element-2",
      (element) => element.textContent || ""
    );

    expect(element1).toBe("Hello, world Text 1");
    expect(element2).toBe("");

    await page.evaluate(() => {
      // @ts-ignore
      document.querySelector("#element-2").innerHTML = "puppeteer";
      // @ts-ignore
      document.addEventListener("__webpack_hmr_sever__", (e) => {
        // @ts-ignore
        const moduleData = e.detail;
        console.log("moduleData", moduleData);
      });
    });
    element2 = await page.$eval(
      "#element-2",
      (element) => element.textContent || ""
    );
    expect(element2).toBe("puppeteer");

    // update module
    // update module
    fse.writeFileSync(
      path.resolve(publicPath, "./Text.tsx"),
      `
        import React from "react";
        const Text: React.FC = () => {
          return <>Text 2</>;
        };
        export default Text;
      `
    );
    await new Promise((reolve) => setTimeout(reolve, 5_000)); // wait reload
    await new Promise((reolve) => setTimeout(reolve, 5_000)); // wait reload

    // if #element-2 === "puppeteer" then the page was not full reloaded
    element1 = await page.$eval(
      "#element-1",
      (element) => element.textContent || ""
    );
    element2 = await page.$eval(
      "#element-2",
      (element) => element.textContent || ""
    );

    expect(element1).toBe("Hello, world Text 2");
    expect(element2).toBe("");
    // // *****************************************************
    await new Promise((reolve) => setTimeout(reolve, 5_000)); // wait reload
    await page.close();
    await new Promise((resolve) => compiler.close(resolve));
    httpServer.close();
    fse.removeSync(publicPath);
  });
  // --------------------------------------------------------------------------------//
  it("client/reload", async () => {
    const app = express();
    const httpServer = await startHttpServer(app);

    // create cache directory
    const random = crypto.randomUUID();
    const publicPath = path.resolve(process.cwd(), "./.cache", random);
    fse.removeSync(publicPath);
    fse.copySync(path.resolve(process.cwd(), "public"), publicPath);
    app.use(express.static(publicPath));

    // webpack settings
    const webpackConfig: webpack.Configuration = {
      entry: [
        path.resolve(publicPath, "./index.tsx"),
        require.resolve("webpack-hmr-server/client.legacy.js"), // "webpack-hmr-server/client.js",
      ],
      // context:
      target: "web",
      devtool: "source-map",
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: "babel-loader",
                options: {
                  presets: ["@babel/preset-env", "@babel/preset-react"],
                  plugins: [
                    "@babel/plugin-proposal-class-properties",
                    ["react-refresh/babel", { skipEnvCheck: true }],
                  ],
                },
              },
            ],
          },
          {
            test: /\.(ts|tsx)$/,
            exclude: /node_modules/,
            use: ["ts-loader"],
          },
        ],
      },
      mode: "development",
      resolve: {
        extensions: [".js", ".ts", ".tsx"],
      },
      output: {
        filename: "index.js",
        path: path.resolve(publicPath, "./build"),
      },
      plugins: [
        new ReactRefreshWebpackPlugin({}),
        new webpack.HotModuleReplacementPlugin({}),
      ],
    };

    const compiler = webpack(webpackConfig);
    webpackHmrServer(compiler, httpServer.server);
    compiler.watch(
      {
        aggregateTimeout: 10,
        poll: 10,
      },
      (err, stats) => {}
    );
    // wait build
    await new Promise((reolve) => setTimeout(reolve, 5_000));
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${httpServer.port}/index.html`);
    await new Promise((reolve) => setTimeout(reolve, 5_000)); // recomendet delay

    // // Scenarion:
    // // *****************************************************
    let element1 = "";
    let element2 = "";

    element1 = await page.$eval(
      "#element-1",
      (element) => element.textContent || ""
    );
    element2 = await page.$eval(
      "#element-2",
      (element) => element.textContent || ""
    );

    expect(element1).toBe("Hello, world Text 1");
    expect(element2).toBe("");

    await page.evaluate(() => {
      // @ts-ignore
      document.querySelector("#element-2").innerHTML = "puppeteer";
      // @ts-ignore
      document.addEventListener("__webpack_hmr_sever__", (e) => {
        // @ts-ignore
        const moduleData = e.detail;
        console.log("moduleData", moduleData);
      });
    });
    element2 = await page.$eval(
      "#element-2",
      (element) => element.textContent || ""
    );
    expect(element2).toBe("puppeteer");

    // update module
    fse.writeFileSync(
      path.resolve(publicPath, "./index.tsx"),
      `
        import React from 'react';
        import ReactDOM from 'react-dom/client';
        import Text from "./Text";

        function App() {
          return (
            <div>
              <h1>Hi, world <Text /></h1>
            </div>
          );
        }

        const root = ReactDOM.createRoot(
          document.getElementById('element-1') as HTMLElement
        );
        root.render(
          <React.StrictMode>
            <App />
          </React.StrictMode>
        );
      `
    );
    await new Promise((reolve) => setTimeout(reolve, 5_000)); // wait reload

    // if #element-2 === "puppeteer" then the page was not full reloaded
    element1 = await page.$eval(
      "#element-1",
      (element) => element.textContent || ""
    );
    element2 = await page.$eval(
      "#element-2",
      (element) => element.textContent || ""
    );

    expect(element1).toBe("Hi, world Text 1");
    expect(element2).toBe("");
    // // *****************************************************
    await new Promise((reolve) => setTimeout(reolve, 5_000)); // wait reload
    await page.close();
    await new Promise((resolve) => compiler.close(resolve));
    httpServer.close();
    fse.removeSync(publicPath);
  });
  // --------------------------------------------------------------------------------//

  it("client/hotreload", async () => {
    const app = express();
    const httpServer = await startHttpServer(app);

    // create cache directory
    const random = crypto.randomUUID();
    const publicPath = path.resolve(process.cwd(), "./.cache", random);
    fse.removeSync(publicPath);
    fse.copySync(path.resolve(process.cwd(), "public"), publicPath);
    app.use(express.static(publicPath));

    // webpack settings
    const webpackConfig: webpack.Configuration = {
      entry: {
        index: path.resolve(publicPath, "./index.tsx"),
      },
      // entry: [path.resolve(publicPath, "./index.tsx")],
      //   path.resolve(publicPath, "./index.tsx"),
      //   require.resolve("webpack-hmr-server/client.legacy.js"), // "webpack-hmr-server/client.js",
      // ],
      // context:
      target: "web",
      devtool: "source-map",
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: "babel-loader",
                options: {
                  presets: ["@babel/preset-env", "@babel/preset-react"],
                  plugins: [
                    "@babel/plugin-proposal-class-properties",
                    ["react-refresh/babel", { skipEnvCheck: true }],
                  ],
                },
              },
            ],
          },
          {
            test: /\.(ts|tsx)$/,
            exclude: /node_modules/,
            use: ["ts-loader"],
          },
        ],
      },
      mode: "development",
      resolve: {
        extensions: [".js", ".ts", ".tsx"],
      },
      output: {
        filename: "index.js",
        path: path.resolve(publicPath, "./build"),
      },
      plugins: [new ReactRefreshWebpackPlugin({})],
    };

    const compiler = webpack(webpackConfig);

    const hotModuleReplacementPlugin = new webpack.HotModuleReplacementPlugin();
    hotModuleReplacementPlugin.apply(compiler);
    new webpack.EntryPlugin(
      compiler.context,
      require.resolve("webpack-hmr-server/client.legacy.js"),
      {
        // eslint-disable-next-line no-undefined
        name: undefined,
      }
    ).apply(compiler);

    webpackHmrServer(compiler, httpServer.server);
    compiler.watch(
      {
        aggregateTimeout: 10,
        poll: 10,
      },
      (err, stats) => {}
    );
    // wait build
    await new Promise((reolve) => setTimeout(reolve, 5_000));
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${httpServer.port}/index.html`);
    await new Promise((reolve) => setTimeout(reolve, 5_000)); // recomendet delay

    // // Scenarion:
    // // *****************************************************
    let element1 = "";
    let element2 = "";

    element1 = await page.$eval(
      "#element-1",
      (element) => element.textContent || ""
    );
    element2 = await page.$eval(
      "#element-2",
      (element) => element.textContent || ""
    );

    expect(element1).toBe("Hello, world Text 1");
    expect(element2).toBe("");

    await page.evaluate(() => {
      // @ts-ignore
      document.querySelector("#element-2").innerHTML = "puppeteer";
      // @ts-ignore
      document.addEventListener("__webpack_hmr_sever__", (e) => {
        // @ts-ignore
        const moduleData = e.detail;
        console.log("moduleData", moduleData);
      });
    });
    element2 = await page.$eval(
      "#element-2",
      (element) => element.textContent || ""
    );
    expect(element2).toBe("puppeteer");

    // update module
    fse.writeFileSync(
      path.resolve(publicPath, "./Text.tsx"),
      `
        import React from "react";
        const Text: React.FC = () => {
          return <>Text 2</>;
        };
        export default Text;
      `
    );
    await new Promise((reolve) => setTimeout(reolve, 5_000)); // wait reload

    // if #element-2 === "puppeteer" then the page was not full reloaded
    element1 = await page.$eval(
      "#element-1",
      (element) => element.textContent || ""
    );
    element2 = await page.$eval(
      "#element-2",
      (element) => element.textContent || ""
    );

    expect(element1).toBe("Hello, world Text 2");
    expect(element2).toBe("puppeteer");
    // // *****************************************************
    await new Promise((reolve) => setTimeout(reolve, 5_000)); // wait reload
    await page.close();
    await new Promise((resolve) => compiler.close(resolve));
    httpServer.close();
    fse.removeSync(publicPath);
  });

  // --------------------------------------------------------------------------------//

  // it("client/error build", async () => {
  //   const app = express();
  //   const httpServer = await startHttpServer(app);

  //   // create cache directory
  //   const random = crypto.randomUUID();
  //   const publicPath = path.resolve(process.cwd(), "./.cache", random);
  //   fse.removeSync(publicPath);
  //   fse.copySync(path.resolve(process.cwd(), "public"), publicPath);
  //   app.use(express.static(publicPath));

  //   // webpack settings
  //   const webpackConfig: webpack.Configuration = {
  //     entry: [
  //       path.resolve(publicPath, "./index.tsx"),
  //       require.resolve("webpack-hmr-server/client.legacy.js"), // "webpack-hmr-server/client.js",
  //     ],
  //     // context:
  //     target: "web",
  //     devtool: "source-map",
  //     module: {
  //       rules: [
  //         {
  //           test: /\.(js|jsx)$/,
  //           exclude: /node_modules/,
  //           use: [
  //             {
  //               loader: "babel-loader",
  //               options: {
  //                 presets: ["@babel/preset-env", "@babel/preset-react"],
  //                 plugins: [
  //                   "@babel/plugin-proposal-class-properties",
  //                   ["react-refresh/babel", { skipEnvCheck: true }],
  //                 ],
  //               },
  //             },
  //           ],
  //         },
  //         {
  //           test: /\.(ts|tsx)$/,
  //           exclude: /node_modules/,
  //           use: ["ts-loader"],
  //         },
  //       ],
  //     },
  //     mode: "development",
  //     resolve: {
  //       extensions: [".js", ".ts", ".tsx"],
  //     },
  //     output: {
  //       filename: "index.js",
  //       path: path.resolve(publicPath, "./build"),
  //     },
  //     plugins: [
  //       new ReactRefreshWebpackPlugin({}),
  //       new webpack.HotModuleReplacementPlugin({}),
  //     ],
  //   };

  //   const compiler = webpack(webpackConfig);
  //   webpackHmrServer(compiler, httpServer.server);
  //   compiler.watch(
  //     {
  //       aggregateTimeout: 10,
  //       poll: 10,
  //     },
  //     (err, stats) => {}
  //   );
  //   // wait build
  //   await new Promise((reolve) => setTimeout(reolve, 5_000));
  //   const page = await browser.newPage();
  //   await page.goto(`http://127.0.0.1:${httpServer.port}/index.html`);
  //   await new Promise((reolve) => setTimeout(reolve, 5_000)); // recomendet delay

  //   // // Scenarion:
  //   // // *****************************************************
  //   let element1 = "";
  //   let element2 = "";

  //   element1 = await page.$eval(
  //     "#element-1",
  //     (element) => element.textContent || ""
  //   );
  //   element2 = await page.$eval(
  //     "#element-2",
  //     (element) => element.textContent || ""
  //   );

  //   expect(element1).toBe("Hello, world Text 1");
  //   expect(element2).toBe("");

  //   await page.evaluate(() => {
  //     // @ts-ignore
  //     document.querySelector("#element-2").innerHTML = "puppeteer";
  //     // @ts-ignore
  //     document.addEventListener("__webpack_hmr_sever__", (e) => {
  //       // @ts-ignore
  //       const moduleData = e.detail;
  //       console.log("moduleData", moduleData);
  //     });
  //   });
  //   element2 = await page.$eval(
  //     "#element-2",
  //     (element) => element.textContent || ""
  //   );
  //   expect(element2).toBe("puppeteer");

  //   // update module
  //   fse.writeFileSync(
  //     path.resolve(publicPath, "./Text.tsx"),
  //     `
  //       import React from "react";
  //       const Text: React.FC = () => {
  //         return <>Text;
  //       };
  //       export default Text;
  //     `
  //   );
  //   await new Promise((reolve) => setTimeout(reolve, 5_000)); // wait reload

  //   // if #element-2 === "puppeteer" then the page was not full reloaded
  //   element1 = await page.$eval(
  //     "#element-1",
  //     (element) => element.textContent || ""
  //   );
  //   element2 = await page.$eval(
  //     "#element-2",
  //     (element) => element.textContent || ""
  //   );

  //   expect(element1).toBe("Hello, world Text 1");
  //   expect(element2).toBe("puppeteer");
  //   // // *****************************************************
  //   await new Promise((reolve) => setTimeout(reolve, 5_000)); // wait reload
  //   await page.close();
  //   await new Promise((resolve) => compiler.close(resolve));
  //   httpServer.close();
  //   fse.removeSync(publicPath);
  // });
});
