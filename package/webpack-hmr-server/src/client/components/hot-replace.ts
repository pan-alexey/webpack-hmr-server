/* eslint-disable filenames/match-regex */
import { Modules } from '../../common/types';
import { unique } from '../helpers/index';

export class ModuleCheck {
  private lastHash: string = __webpack_hash__;
  private moduleHot?: __WebpackModuleApi.Hot;
  constructor(moduleHot?: __WebpackModuleApi.Hot) {
    this.moduleHot = moduleHot;
  }

  private moduleHotCheck = async (): Promise<Modules> => {
    if (!this.moduleHot) {
      throw null;
    }
    let updatedModules = await this.moduleHot.check(true);
    if (!updatedModules) {
      throw null;
    }
    if (!this.webpackHashCheck()) {
      const modules = await this.moduleHotCheck();
      updatedModules = [...updatedModules, ...modules];
    }

    return unique(updatedModules);
  };

  public webpackHashCheck = (hash?: string): boolean => {
    this.lastHash = hash ? hash : this.lastHash;
    return this.lastHash === __webpack_hash__;
  };

  public check = async (): Promise<null | Modules> => {
    try {
      const modules = await this.moduleHotCheck();
      return modules;
    } catch (err) {
      return null;
    }
  };

  public hotEnable = (): boolean => {
    return !!this.moduleHot;
  };
}
