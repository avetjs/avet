import { createElement, Children, Component } from 'react';
import { assign, select } from './util';

const CONTEXT_TYPES = {
  appStore: () => {},
};

export class Provider extends Component {
  getChildContext() {
    return { appStore: this.props.store };
  }
  render() {
    return Children.only(this.props.children);
  }
}

Provider.childContextTypes = CONTEXT_TYPES;

/** Wire a component up to the store. Passes state as props, re-renders on change.
 *  @param {String} mapStoreToProps  A function mapping of store state to prop values, or an array/CSV of properties to map.
 *  @returns {Component} ConnectedComponent
 *  @example
 *    const Foo = connect('xxStore.foo,xxStore.bar')( ({ xxStore }) => <div /> )
 */
export function connect(mapStoreToProps) {
  if (mapStoreToProps && typeof mapStoreToProps !== 'string') {
    throw Error('mapStoreToProps only support string');
  }

  mapStoreToProps = select(mapStoreToProps);

  return Child => {
    function Wrapper(props, context) {
      Component.call(this, props, context);

      const { appStore } = context;
      const stores = {};

      for (const s in appStore) {
        const store = appStore[s];

        const state = mapStoreToProps(store ? store.getState() : {}, s, store);
        stores[s] = assign({}, state);

        appStore[s].__update = () => {
          const mapped = mapStoreToProps(
            store ? store.getState() : {},
            s,
            store
          );

          for (const i in mapped) {
            if (mapped[i] !== state[i]) {
              stores[s] = mapped;
              return this.forceUpdate();
            }
          }

          for (const i in state) {
            if (!(i in mapped)) {
              stores[s] = mapped;
              return this.forceUpdate();
            }
          }
        };
      }

      this.componentDidMount = () => {
        for (const s in appStore) {
          const store = appStore[s];
          store.__update();
          store.subscribe(store.__update);
        }
      };

      this.componentWillUnmount = () => {
        for (const s in appStore) {
          const store = appStore[s];
          store.unsubscribe(store.__update);
        }
      };

      this.render = () => createElement(Child, assign({}, stores, this.props));
    }

    Wrapper.contextTypes = CONTEXT_TYPES;
    Wrapper.prototype = Object.create(Component.prototype);
    Wrapper.prototype.constructor = Wrapper;

    return Wrapper.prototype.constructor;
  };
}
