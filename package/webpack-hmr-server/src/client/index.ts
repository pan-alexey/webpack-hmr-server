import { ModuleCheck } from './components/hot-replace';
import { ProcessMessage } from './components/process-message';
import { SERVER_PATH_NAME, TIMEOUT } from '../common/constants';
import { SocketClient } from './components/socket-client';
import type { Message, Event } from '../common/types';

export interface Options {
  refresh: () => void;
  sendEvent: (event: Event) => void;
}

export const app = ({ refresh, sendEvent }: Options) => {
  const moduleCheck = new ModuleCheck(module.hot);
  const processMessage = new ProcessMessage(moduleCheck);
  const socketClient = new SocketClient('ws://' + location.host + `/${SERVER_PATH_NAME}`, TIMEOUT);
  socketClient
    .onConnect(function (client) {
      client.send('init');
    })
    .onReConnect(function (client) {
      client.send('check');
    })
    .onClose(() => {
      // Dissconect
      sendEvent({
        hotEnable: moduleCheck.hotEnable(),
        message: 'Disconect',
        action: 'disconect',
        refresh: false,
      });
    })
    .onMessage(function (serverMessage) {
      const message = JSON.parse(serverMessage) as Message;
      processMessage.getEvent(message).then((event) => {
        sendEvent(event);
        if (event.refresh) {
          refresh();
        }
      });
    });
};
