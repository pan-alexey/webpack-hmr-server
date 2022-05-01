export const app = async () => {
  const event = new Event('hello', { bubbles: true }); // (2)
  document.dispatchEvent(event);
};
