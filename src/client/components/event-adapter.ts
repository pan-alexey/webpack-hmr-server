/* eslint-disable filenames/match-regex */

export function eventAdapter<TData>(adapter?: (data: TData) => void) {
  return (data: TData): void => {
    adapter && adapter(data);
    const event = new CustomEvent('_test_', {
      cancelable: true,
      bubbles: true,
      detail: data,
    });
    document.dispatchEvent(event);
  };
}
