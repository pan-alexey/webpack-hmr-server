/* eslint-disable filenames/match-regex */

// Dont need test - send browser event;
// dont have logic
/* istanbul ignore next */
export function eventAdapter<TData>(eventName: string) {
  return (data: TData): void => {
    const event = new CustomEvent(eventName, {
      cancelable: true,
      bubbles: true,
      detail: data,
    });
    document.dispatchEvent(event);
  };
}
