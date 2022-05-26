export const unique = (arr: Array<string | number>): Array<string> => {
  const obj: Record<string, null> = {};
  arr.forEach(function (value) {
    obj[value] = null;
  });

  return Object.keys(obj);
};

export const formatErrStack = function (err: Error) {
  const message = err.message;
  const stack = err.stack;
  if (!stack) {
    return message;
  } else if (stack.indexOf(message) < 0) {
    return message + '\n' + stack;
  } else {
    return stack;
  }
};
