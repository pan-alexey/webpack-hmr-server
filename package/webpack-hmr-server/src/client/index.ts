import { eventAdapter } from './components/event-adapter';
import { ModuleReplacement } from './components/module-replacement';
import { SocketClient } from './components/socket-client';

import { EVENT_NAME, SERVER_PATH_NAME, TIMEOUT } from '../common/constants';
import { Events, ModuleData, Message, ServerActions } from '../common/types';

export interface HotModuleClientOptions {
  sendEvent: (event: Events) => void;
  replaceModiles: (moduleData: ModuleData, serverAction: ServerActions) => void;
  pageReload: () => void;
}

export class HotModuleClient {
  private sendEvent: (event: Events) => void;
  private replaceModiles: (moduleData: ModuleData, serverAction: ServerActions) => void;
  private pageReload: () => void;

  constructor(options: HotModuleClientOptions) {
    this.sendEvent = options.sendEvent;
    this.replaceModiles = options.replaceModiles;
    this.pageReload = options.pageReload;
  }

  public emit(serverMessage: string) {
    try {
      const message = JSON.parse(serverMessage) as Message;
      this.process(message);
    } catch (error) {
      this.sendEvent({
        message: 'Server message error',
        moduleData: null,
      });
    }
  }

  private process(message: Message) {
    if (message.action === 'reload') {
      this.sendEvent({
        message: 'Remote reload',
        serverAction: message.action,
        moduleData: null,
      });
      this.pageReload();
      return;
    }

    const moduleData = message.data;
    if (moduleData === null) {
      this.sendEvent({
        message: 'Module data is null',
        serverAction: message.action,
        moduleData: null,
      });
      return;
    }

    if (moduleData.errors.length > 0) {
      this.sendEvent({
        message: 'Build error',
        serverAction: message.action,
        moduleData,
      });
      return;
    }

    if (['init', 'check'].includes(message.action)) {
      if (module.hot) {
        this.replaceModiles(moduleData, message.action);
      }
      return;
    }

    if (message.action === 'build') {
      this.replaceModiles(moduleData, message.action);
      return;
    }
  }
}

export const app = () => {
  /* istanbul ignore next */
  const sendEvent = eventAdapter<Events>(EVENT_NAME);

  const pageReload = () => {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const moduleReplacement = new ModuleReplacement({
    pageReload,
    sendEvent,
  });

  const hotModuleClient = new HotModuleClient({
    sendEvent,
    pageReload,
    replaceModiles: moduleReplacement.emit,
  });

  const socketClient = new SocketClient('ws://' + location.host + `/${SERVER_PATH_NAME}`, TIMEOUT);

  socketClient
    .onConnect((client) => {
      const action: ServerActions = 'init';
      client.send(action);
    })
    .onReConnect((client) => {
      const action: ServerActions = 'check';
      client.send(action);
    })
    .onClose(() => {
      sendEvent({
        message: 'Server reconnect',
        moduleData: null,
      });
    })
    .onMessage((message) => {
      hotModuleClient.emit(message);
    });
};
