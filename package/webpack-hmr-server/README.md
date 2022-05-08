# webpack-hmr-server
Webpack hot reloading using http server and websocket

![npm](https://img.shields.io/npm/v/webpack-hmr-server)
![npm](https://img.shields.io/npm/dm/webpack-hmr-server)
![licence](https://img.shields.io/badge/licence-MIT-green)

![test](https://img.shields.io/badge/React-done-green)
![test](https://img.shields.io/badge/VanillaJS-done-green)
![test](https://img.shields.io/badge/VUE-wait-red)

Alternative to [webpack-hot-middleware](https://www.npmjs.com/package/webpack-hot-middleware). This allows you to add hot reloading into an existing server without webpack-dev-server. This package will be useful if you don't use middleware, or use your own server implementation

This package gives you the ability to check for module changes within your application and execute those changes using webpack's HMR API. 
Actually making your application capable of using hot reloading to make seamless changes is out of scope, and usually handled by another library.
Unlike [webpack-hot-middleware](https://www.npmjs.com/package/webpack-hot-middleware), the package will not generate an event if the build fails. Instead, it will send a message to the client

You have the opportunity to independently control the moment when the module should be reloaded. It is also possible to update modules automatically.

The user has the right to decide on his own what will be the overlay or message in the browser console. This will allow you to control your preference for build errors or informational messages.

## Install

```sh
npm install -D webpack-hmr-server
```

## Example usage


```ts
import webpackHmrServer from "webpack-hmr-server";
const webpackConfig: webpack.Configuration = {
  entry: [
    path.resolve(__PATH__, "./index.js"),
    "webpack-hmr-server/client.js", // Important to add to every entries
    // "webpack-hmr-server/client.legacy.js", // for legacy browsers
  ],
  mode: "development",
  output: {
    filename: "index.js",
    path: path.resolve(__PATH__, "./build"),
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
};

const server = http.createServer();
webpackHmrServer(compiler, server); //  auto subscribes to compiler hooks and sends service message
const compiler = webpack(webpackConfig);
server.listen(port, callback)
```
- - -

## How it Works

There are several ways to use the package:
 * Default - auto subscribes to compiler hooks and sends service message
 * Manual - manula send service message to the client

When the client receives a message, it will check to see if the local code is up to date. If it isn't up to date, it will trigger webpack hot module reloading or handles additional cases.

Communication between the server and the client occurs through a websocket.

- - -
### Client flow schema

![Client flow schema](https://github.com/pan-alexey/webpack-hmr-server/blob/main/static/flow-client.jpg?raw=true)

## How does the HMR runtime determine that there is an update?

If you run webpack in watch and HMR mode, then for each update of the source files, in addition to rebuilding the bundle, an update manifest will be created and one js file for each updated chunk. These js files will only contain updated modules.


The update manifest is a json file containing the new compilation hash and a list of updated files. The compilation hash is generated during the bundle build and passed to the HMR runtime.

if module.hot.check(true) is called in a running application, then a request for JSON will be sent. If successful, modules will be updated

- - -
## Module Server 
![language](https://img.shields.io/badge/language-typescript-blue)
![coverage-server](https://img.shields.io/badge/coverage-95.45%25-green)
![e2e](https://img.shields.io/badge/e2e-waiting-red)

| Component | Tags | Description |
| - | - | - |
| webpack-stats | ![coverage-webpack-stats](https://img.shields.io/badge/coverage-100%25-green) | Normalize module data |
| socket-server | ![coverage-socket-server](https://img.shields.io/badge/coverage-96.42%25-green) | Custom socket server with multipath |
| hot-module-service | ![coverage-hot-module-service](https://img.shields.io/badge/coverage-100%25-green) | Service for send module data to client, with use socket server and normalize module data |
| utils | ![coverage-server-utils](https://img.shields.io/badge/coverage-100%25-green) | Helpers for server application |

## Module Client
![language](https://img.shields.io/badge/language-typescript-blue)
![coverage](https://img.shields.io/badge/coverage-67.78%25-yellow)
![e2e](https://img.shields.io/badge/e2e-waiting-red)

| Component | Tags | Description |
| - | - | - |
| socket-client | ![coverage-socket-client](https://img.shields.io/badge/coverage-100%25-green) | Custom web socket client with recconect |
| client| ![coverage-client](https://img.shields.io/badge/coverage-~69.65%25-yellow) | client application |
| utils | ![coverage-client-utils](https://img.shields.io/badge/coverage-100%25-green) | Helpers for client application |
| module-replacement | ![coverage-module-replacement](https://img.shields.io/badge/coverage-26.19%25-red) | There is no way to cover the test. e2e testing only |

- - -

## License

MIT License

Copyright (c) 2022 Pan Alexey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
