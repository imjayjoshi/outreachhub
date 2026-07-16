import createWebStorage from "redux-persist/lib/storage/createWebStorage";

/**
 * SSR-safe storage for redux-persist.
 * On the server (where `window` is undefined), a no-op storage is used
 * so redux-persist doesn't crash trying to access localStorage.
 * On the client, normal localStorage is used.
 */

function createNoopStorage() {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: string) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
}

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

export default storage;
