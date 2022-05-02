# webpack-hmr-server
Webpack hot reloading using http server and websocket

![npm](https://img.shields.io/npm/v/webpack-hmr-server)
![npm](https://img.shields.io/npm/dm/webpack-hmr-server)

## Module Server 
![language](https://img.shields.io/badge/language-typescript-blue)
![coverage-server](https://img.shields.io/badge/coverage-95.45%-green)
![e2e](https://img.shields.io/badge/e2e-waiting-red)

| Component | Tags | Description |
| - | - | - |
| webpack-stats | ![coverage-webpack-stats](https://img.shields.io/badge/coverage-100%-green) | Normalize module data |
| socket-server | ![coverage-socket-server](https://img.shields.io/badge/coverage-96.42%-green) | Custom socket server with multipath |
| hot-module-service | ![coverage-hot-module-service](https://img.shields.io/badge/coverage-100%-green) | Service for send module data to client, with use socket server and normalize module data |
| utils | ![coverage-server-utils](https://img.shields.io/badge/coverage-100%-green) | Helpers for server application |

## Module Client
![language](https://img.shields.io/badge/language-typescript-blue)
![coverage](https://img.shields.io/badge/coverage-67.78%-yellow)
![e2e](https://img.shields.io/badge/e2e-waiting-red)

| Component | Tags | Description |
| - | - | - |
| socket-client | ![coverage-socket-client](https://img.shields.io/badge/coverage-100%-green) | Custom web socket client with recconect |
| client| ![coverage-client](https://img.shields.io/badge/coverage-~69.65%-yellow) | client application |
| utils | ![coverage-client-utils](https://img.shields.io/badge/coverage-100%-green) | Helpers for client application |
| module-replacement | ![coverage-module-replacement](https://img.shields.io/badge/coverage-26.19%-red) | There is no way to cover the test. e2e testing only |