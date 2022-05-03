import crypto from "crypto";
import puppeteer from "puppeteer";
import webpack from "webpack";
import express from "express";

import webpackHmrServer from "webpack-hmr-server";
import path from "path";
import fse from "fs-extra";

import { startHttpServer } from "./__mocks__/fixtrures";

describe("e2e/vanilla", () => {
  let browser: puppeteer.Browser;
  let files: Record<string, string>;
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  it("client/connect reconnect close", async () => {
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
        path.resolve(publicPath, "./index.js"),
        "webpack-hmr-server/client.js",
      ],
      mode: "development",
      output: {
        filename: "index.js",
        path: path.resolve(publicPath, "./build"),
      },
      plugins: [new webpack.HotModuleReplacementPlugin({})],
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
    await new Promise((reolve) => setTimeout(reolve, 1_000));
    const page = await browser.newPage();
    console.log(`http://127.0.0.1:${httpServer.port}/index.html`);
    await page.goto(`http://127.0.0.1:${httpServer.port}/index.html`);
    await new Promise((reolve) => setTimeout(reolve, 5_000)); // recomendet delay

    // Scenarion:
    // *****************************************************
    let element1 = "";
    let element2 = "";

    element1 = await page.$eval("#element-1", (element) => element.innerHTML);
    element2 = await page.$eval("#element-2", (element) => element.innerHTML);

    expect(element1).toBe("data");
    expect(element2).toBe("");

    await page.evaluate(() => {
      // @ts-ignore
      document.querySelector("#element-2").innerHTML = "puppeteer";
    });
    element2 = await page.$eval("#element-2", (element) => element.innerHTML);
    expect(element2).toBe("puppeteer");

    // update module
    fse.writeFileSync(
      path.resolve(publicPath, "./module.js"),
      'export default "123";'
    );
    await new Promise((reolve) => setTimeout(reolve, 1_000));

    // if #element-2 === "puppeteer" then the page was not completely reloaded
    element1 = await page.$eval("#element-1", (element) => element.innerHTML);
    element2 = await page.$eval("#element-2", (element) => element.innerHTML);
    expect(element1).toBe("123");
    expect(element2).toBe("puppeteer");

    // *****************************************************

    await new Promise((resolve) => compiler.close(resolve));
    httpServer.close();
    fse.removeSync(publicPath);
  });
});
