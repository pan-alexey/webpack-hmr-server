/* eslint-disable filenames/match-regex */
import type { Message, Event } from '../../common/types';
import { ModuleCheck } from './hot-replace';

export class ProcessMessage {
  private moduleCheck: ModuleCheck;
  constructor(moduleCheck: ModuleCheck) {
    this.moduleCheck = moduleCheck;
  }

  public getEvent = async (remoteMessage: Message): Promise<Event> => {
    const event = await this.processEvent(remoteMessage);
    return JSON.parse(JSON.stringify(event)) as Event;
  };

  private processEvent = async (remoteMessage: Message): Promise<Event> => {
    const state: Event = {
      resourceQuery: __resourceQuery || '',
      message: 'unknown',
      refresh: false,
      hotEnable: this.moduleCheck.hotEnable(),
      state: remoteMessage.state,
      action: remoteMessage.action,
      modules: [],
    };

    if (remoteMessage.action === 'refresh') {
      state.message = 'Remote refresh';
      state.refresh = true;
      return state;
    }

    if (!remoteMessage.state) {
      state.message = 'Not valid state';
      state.refresh = false;
      return state;
    }

    const clinet = remoteMessage.state.client;

    // Detect errors
    const clientErrors = remoteMessage.state.client.errors;
    const serverErrors = remoteMessage.state.server?.errors || [];
    if (clientErrors.length > 0 || serverErrors.length > 0) {
      state.message = 'Build with error';
      state.refresh = false;
      return state;
    }

    if (this.moduleCheck.webpackHashCheck(clinet.hash)) {
      state.message = 'Already update';
      state.refresh = false;
      return state;
    }
    if (!this.moduleCheck.hotEnable()) {
      state.message = 'Hot module reload disable';
      state.refresh = !this.moduleCheck.webpackHashCheck(clinet.hash);
      return state;
    }

    // hot reload modules
    const modules = await this.moduleCheck.check();
    if (modules) {
      state.message = 'Modules updated';
      state.refresh = false;
      state.modules = modules;
      return state;
    }

    state.refresh = true;
    state.message = 'Update failed';
    return state;
  };
}
