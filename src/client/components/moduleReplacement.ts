/* eslint-disable filenames/match-regex */
/* eslint-disable no-console */
/**
 * Based on https://github.com/webpack/webpack/blob/main/hot/dev-server.js
 *          https://github.com/webpack/webpack/blob/main/hot/only-dev-server.js
 * Original copyright Tobias Koppers @sokra (MIT license)
 */
import { unique } from '../utils/index';

export class ModuleReplacement {
  private lastHash = __webpack_hash__;

  private applyOptions = {
    ignoreUnaccepted: true,
    ignoreDeclined: true,
    ignoreErrored: true,
    onUnaccepted: (data: unknown) => {
      // global hook event
    },
    onDeclined: (data: unknown) => {
      // global hook event
    },
    onErrored: (data: unknown) => {
      // ** global hook event ***
    },
  };

  public pageReload(): void {
    window.location.reload();
  }

  private upToDate = (hash?: string): boolean => {
    if (hash) {
      this.lastHash = hash;
    }
    return this.lastHash === __webpack_hash__;
  };

  public async emit(hash?: string): Promise<void> {
    // check error
    if (module?.hot?.status() === 'idle' && !this.upToDate(hash)) {
      await this.check();
    }
  }

  private async check(prewRenewedModules: Array<string | number> = []): Promise<void> {
    // ** global hook event ***
    // https://webpack.js.org/api/hot-module-replacement/#check
    try {
      // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/60088
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const updatedModules = (await module.hot.check()) as Array<string | number> | null;

      if (!updatedModules) {
        // ** global hook event ***//
        this.pageReload();
        return;
      }

      // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/60088
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const renewedModules = (await module.hot.apply(this.applyOptions)) as Array<string | number>;

      if (!this.upToDate()) {
        this.check(renewedModules); // save prew modules
        return;
      }

      this.processModules(
        updatedModules,
        prewRenewedModules.concat(renewedModules), // aggregate
      );
    } catch (error) {
      const status = module?.hot?.status() || '';
      if (['abort', 'fail'].indexOf(status) >= 0) {
        // ** global hook event ***//
        this.pageReload();
        return;
      }
    }
  }

  private processModules(updatedModules: Array<string | number>, renewedModules: Array<string | number>) {
    const unacceptedModules = updatedModules.filter(function (moduleId) {
      return renewedModules && renewedModules.indexOf(moduleId) < 0;
    });

    if (unacceptedModules.length > 0) {
      // ** global hook event ***//
      this.pageReload();
      return;
    }

    const uniqueRenewedModules = unique(renewedModules);
    if (uniqueRenewedModules.length < 1) {
      return;
    }

    console.groupCollapsed('[HMR] reload modules');
    uniqueRenewedModules.forEach(function (moduleId) {
      console.log('[HMR]  - ' + moduleId);
    });
    console.groupEnd();
  }
}

const moduleReplacement = new ModuleReplacement();

export default (data: unknown): void => {
  const moduleData = data as {
    action: string;
    data: {
      hash?: string;
      errors: Array<{
        file: string;
        loc: string;
        message: string;
        moduleName?: string;
      }>;
    };
  };

  if (moduleData.action === 'reload') {
    moduleReplacement.pageReload();
    return;
  }

  if (moduleData.data.errors.length > 0) {
    console.group('[HMR] error modules');
    moduleData.data.errors.forEach(({ message }) => {
      console.log(message);
    });
    console.groupEnd();
    return;
  }

  moduleReplacement.emit(moduleData.data.hash);
};
