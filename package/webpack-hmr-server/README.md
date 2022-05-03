# webpack-hmr-server
Webpack hot reloading using http server and websocket

![npm](https://img.shields.io/npm/v/webpack-hmr-server)
![npm](https://img.shields.io/npm/dm/webpack-hmr-server)
![licence](https://img.shields.io/badge/licence-MIT-green)

Alternative to [webpack-hot-middleware](https://www.npmjs.com/package/webpack-hot-middleware). This allows you to add hot reloading into an existing server without webpack-dev-server.

This package gives you the ability to check for module changes within your application and execute those changes using webpack's HMR API. 
Actually making your application capable of using hot reloading to make seamless changes is out of scope, and usually handled by another library.
Unlike [webpack-hot-middleware](https://www.npmjs.com/package/webpack-hot-middleware), the package will not generate an event if the build fails. Instead, it will send a message to the client

The user has the right to decide on his own what will be the overlay or message in the browser console. This will allow you to control your preference for build errors or informational messages.

## Install

```sh
npm install -D webpack-hmr-server
```

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