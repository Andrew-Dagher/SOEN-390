// EventObserver.js

/**
 * A simple Subject/Observer (Pub/Sub) implementation.
 * - `subscribe(fn)`: Adds an observer callback.
 * - `unsubscribe(fn)`: Removes an observer callback.
 * - `notify(data)`: Invokes all subscribed callbacks with `data`.
 */
export default class EventObserver {
  constructor() {
    // Holds an array of callback functions
    this.observers = [];
  }

  /**
   * Subscribe a callback function (observer)
   * @param {Function} fn - The callback to be invoked when notify() is called
   */
  subscribe(fn) {
    this.observers.push(fn);
  }

  /**
   * Unsubscribe a previously subscribed function
   * @param {Function} fn - The callback to remove
   */
  unsubscribe(fn) {
    this.observers = this.observers.filter((subscriber) => subscriber !== fn);
  }

  /**
   * Notify all observers, passing `data` to each callback
   * @param {*} data - The data to pass along (e.g., an array of events)
   */
  notify(data) {
    this.observers.forEach((observerFn) => observerFn(data));
  }
}
