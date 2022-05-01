export class ModuleEvent {
  dispatch() {
    const event = new CustomEvent('_test_', {
      cancelable: true,
      bubbles: true,
      detail: { name: 'Вася' },
    });
    document.dispatchEvent(event);
  }
}

const moduleEvent = new ModuleEvent();

export const app = () => {
  setInterval(() => {
    moduleEvent.dispatch();
  }, 5000);
};
