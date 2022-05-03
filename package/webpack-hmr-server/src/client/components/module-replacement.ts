/* eslint-disable filenames/match-regex */
//  Based on https://github.com/webpack/webpack/blob/main/hot/dev-server.js

import { unique, formatErrStack } from '../utils/helpers';
import { ModuleData, Modules, Events, ServerActions } from '../../common/types';

export class UserException {
  public message: string;
  public pageReload: boolean;
  constructor(options: { message: string; pageReload: boolean }) {
    this.message = options.message;
    this.pageReload = options.pageReload;
  }
}

export const webpackHashCheck = function () {
  let lastHash: string = __webpack_hash__;
  return function (hash?: string): boolean {
    lastHash = hash ? hash : lastHash;
    return lastHash === __webpack_hash__;
  };
};

export interface ModuleReplacementOptions {
  sendEvent: (data: Events) => void;
  pageReload: () => void;
}
// This functionality is difficult to open with unit tests.
// ModuleReplacement covered by e2e testing
export class ModuleReplacement {
  private webpackHashCheck = webpackHashCheck();
  private sendEvent: (data: Events) => void;
  private pageReload: () => void;

  constructor(options: ModuleReplacementOptions) {
    this.sendEvent = options.sendEvent;
    this.pageReload = options.pageReload;
  }

  // Hot Reload (Main method)
  private moduleHotCheck = async (): Promise<Modules> => {
    // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/60088
    // eslint-disable-next-line
    // @ts-ignore
    let updatedModules = (await module.hot.check(true)) as Modules; // check(true) - auto apply modules

    if (!updatedModules) {
      throw new UserException({
        message: 'Cannot find update',
        pageReload: true,
      });
    }

    if (!this.webpackHashCheck()) {
      const modules = await this.moduleHotCheck();
      updatedModules = [...updatedModules, ...modules];
    }
    return unique(updatedModules);
  };

  private check = async (moduleData: ModuleData, serverAction: ServerActions): Promise<void> => {
    try {
      const updatedModules = await this.moduleHotCheck();
      this.sendEvent({
        message: 'Modules updated',
        serverAction,
        updatedModules: updatedModules,
        moduleData,
      });
    } catch (error) {
      if ((error as UserException).pageReload) {
        this.sendEvent({
          message: 'Cannot find update. Page will be full reload',
          serverAction,
          moduleData,
        });
        this.pageReload();
        return;
      }

      const status = module?.hot?.status() || '';
      if (['abort', 'fail'].indexOf(status) >= 0) {
        this.sendEvent({
          message: 'Cannot apply update. Page will be full reload',
          serverAction,
          moduleData,
        });
        this.pageReload();
        return;
      } else {
        this.sendEvent({
          message: 'Update failed',
          serverAction,
          stack: formatErrStack(error as Error),
          moduleData,
        });
      }
    }
  };

  public emit = (moduleData: ModuleData, serverAction: ServerActions): void => {
    if (!module.hot) {
      this.sendEvent({
        message: 'Hot Module Replacement is disabled. Page will be full reload',
        serverAction,
        moduleData,
      });
      this.pageReload();
      return;
    }

    if (this.webpackHashCheck(moduleData.hash)) {
      this.sendEvent({
        message: 'Already update',
        serverAction,
        moduleData,
      });
      return;
    }

    this.check(moduleData, serverAction);
  };
}
