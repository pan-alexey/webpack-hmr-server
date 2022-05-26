export const unique = (arr: Array<string | number>): Array<string> => {
  const obj: Record<string, null> = {};
  arr.forEach(function (value) {
    obj[value] = null;
  });

  return Object.keys(obj);
};
