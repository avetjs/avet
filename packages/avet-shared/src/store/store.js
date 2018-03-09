import devTools from './devTools';
import { assign } from './util';
import { isBrowser } from 'avet-utils/lib/common';

const stores = {};

// modifiy by https://github.com/developit/unistore
export default class Store {
  constructor(state) {
    if (state) {
      this.state = state;
    }

    this.createStore();
  }

  createStore = () => {
    const store =
      process.env.NODE_ENV === 'production'
        ? new StoreModel(this.state, this)
        : devTools(new StoreModel(this.state, this));

    for (const prop in store) {
      this[prop] = store[prop];
    }
  };
}

class StoreModel {
  constructor(state = {}, context) {
    this.listeners = [];
    this.state = state;
    this.context = context;
  }

  /** Create a bound copy of the given action function.
   *  The bound returned function invokes action() and persists the result back to the store.
   *  If the return value of `action` is a Promise, the resolved value will be used as state.
   *  @param {Function} action	An action of the form `action(state, ...args) -> stateUpdate`
   *  @returns {Function} boundAction()
   */
  dispatch = action => {
    const apply = result => {
      if (result != null) {
        this.setState(result, false, action);
      }
    };

    const handler = () => {
      const args = [ this.state ];
      for (let i = 0; i < arguments.length; i++) args.push(arguments[i]);
      const ret = action.apply(this.context, args);
      if (ret != null) {
        if (ret.then) {
          return ret.then(apply);
        } else {
          return apply(ret);
        }
      }
    };

    // support store.action('xxxxxxx', args);
    if (typeof action === 'string') {
      // if store data exist in setup and skip.
      if (isBrowser() && window.__IS_INIT__) {
        return;
      }

      action = this.context[action];
      if (typeof action !== 'function') {
        throw Error(`${arguments[0]} action not exist in store`);
      }
      const args = [ this.state ];
      for (let i = 1; i < arguments.length; i++) args.push(arguments[i]);
      return handler(...args);
    } else {
      // Note: perf tests verifying this implementation: https://esbench.com/bench/5a295e6299634800a0349500
      return () => {
        const args = [ this.state ];
        for (let i = 0; i < arguments.length; i++) args.push(arguments[i]);
        handler(...args);
      };
    }
  };

  /** Apply a partial state object to the current state, invoking registered listeners.
   *  @param {Object} update				An object with properties to be merged into state
   *  @param {Boolean} [overwrite=false]	If `true`, update will replace state instead of being merged into it
   */
  setState = (update, overwrite, action) => {
    this.state = overwrite ? update : assign(assign({}, this.state), update);
    const currentListeners = this.listeners;
    for (let i = 0; i < currentListeners.length; i++) {
      currentListeners[i](this.state, action);
    }
  };

  /** Retrieve the current state object.
   *  @returns {Object} state
   */
  getState = () => {
    return this.state;
  };

  /**
   * 缓存 store
   */
  setStore = (storeName, store) => {
    stores[storeName] = store;
  };

  getStore = storeName => {
    if (storeName) {
      return stores[storeName];
    }
    return stores;
  };

  /** Register a listener function to be called whenever state is changed. Returns an `unsubscribe()` function.
   *  @param {Function} listener	A function to call when state changes. Gets passed the new state.
   *  @returns {Function} unsubscribe()
   */
  subscribe = listener => {
    this.listeners.push(listener);
    return () => {
      this.unsubscribe(listener);
    };
  };

  /** Remove a previously-registered listener function.
   *  @param {Function} listener	The callback previously passed to `subscribe()` that should be removed.
   *  @function
   */
  unsubscribe = listener => {
    const out = [];
    for (let i = 0; i < this.listeners.length; i++) {
      if (listener === this.listeners[i]) {
        listener = null;
      } else {
        out.push(this.listeners[i]);
      }
    }
    this.listeners = out;
  };
}
