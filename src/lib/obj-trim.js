export default function trimObj(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  return Object.keys(obj).reduce(
    (acc, key) => {
      const value = obj[key];
      if (typeof value === "string") {
        acc[key] = value.trim();
      } else if (typeof value === "object" && value !== null) {
        acc[key] = trimObj(value);
      } else {
        acc[key] = value;
      }
      return acc;
    },
    Array.isArray(obj) ? [] : {},
  );
}
