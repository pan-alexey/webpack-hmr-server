# webpack-hmr-server
Webpack hot reloading using http server and websocket

![npm](https://img.shields.io/npm/v/webpack-hmr-server)
![npm](https://img.shields.io/npm/dm/webpack-hmr-server)
![licence](https://img.shields.io/badge/licence-MIT-green)

![test](https://img.shields.io/badge/ReactJS-success-green)
![test](https://img.shields.io/badge/VueJS-todo-red)
![test](https://img.shields.io/badge/VanillaJS-done-green)

### Module Server 
![language](https://img.shields.io/badge/language-typescript-blue)
![coverage-server](https://img.shields.io/badge/coverage-100%25-green)
![e2e](https://img.shields.io/badge/e2e-done-green)

### Module Client
![language](https://img.shields.io/badge/language-typescript-blue)
![coverage:client](https://img.shields.io/badge/coverage-100%25-green)
![e2e](https://img.shields.io/badge/e2e-done-green)


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

new webpack.EntryPlugin(compiler.context, "webpack-hmr-server/client.legacy.js", {
  name: undefined,
}).apply(compiler);

server.listen(port, callback)
```


## Example usage for create custom overlay

```ts
import type { Types } from 'webpack-hmr-server';

document.addEventListener("__webpack_hmr_sever__", (e) => {
  const { detail } = e as unknown as { detail: unknown };
  const event = detail as Types.Event;

  // custom logic for overlay
})
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

if ```module.hot.check(true)``` is called in a running application, then a request for JSON will be sent. If successful, modules will be updated

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
