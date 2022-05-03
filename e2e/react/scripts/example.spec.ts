import puppeteer from "puppeteer";
import webpack from "webpack";
import express from "express";
import * as http from "http";
import * as net from "net";

describe("client/socket-client", () => {
  let browser: puppeteer.Browser;

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
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(resolve));
    const port = (server.address() as net.AddressInfo).port;

    console.log("http://127.0.0.1:" + port);

    console.log(process.cwd());
    expect(1).toBe(1);
    const page = await browser.newPage();

    await page.goto(`http://127.0.0.1:${port}`);
    await new Promise((reolve) => setTimeout(reolve, 10_000));
    server.close();
  });
});
