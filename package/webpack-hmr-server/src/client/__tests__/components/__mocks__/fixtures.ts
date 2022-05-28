export const touchWebpackHash = () => {
  Object.assign(global, { __webpack_hash__: `${parseInt(__webpack_hash__) + 1}` });
};

export class ModuleHotFixtures {
  private nullable;
  private moduleIndex = 0;
  private updateWebpackHash;
  private moduleHot = false;

  constructor({ nullable = true, updateWebpackHash = false, moduleHot = false }) {
    this.nullable = nullable;
    this.updateWebpackHash = updateWebpackHash;
    this.moduleHot = moduleHot;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public check = (stub = true): null | Array<string | number> => {
    if (this.nullable) return null;

    // Note
    // Т/к мы запускаем проверку модулей с авто применением,
    // то в этом шаге произходит пересчет __webpack_hash__
    // фикстура инкрементирует значением каждый вызова moduleHot.check
    if (this.updateWebpackHash) {
      touchWebpackHash();
    }

    this.moduleIndex++;
    return [0, this.moduleIndex];
  };
}
