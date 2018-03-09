// Bind an object/factory of actions to the store and wrap them.
export function mapActions(actions, store) {
  if (typeof actions === 'function') actions = actions(store);
  const mapped = {};
  for (const i in actions) {
    mapped[i] = store.action(actions[i]);
  }
  return mapped;
}

const excludeProps = [ 'state', 'action' ];

// select('foo,bar') creates a function of the form: ({ foo, bar }) => ({ foo, bar })
export function select(properties) {
  const props = {};
  if (properties) {
    properties.split(/\s*,\s*/).forEach(v => {
      const p = v.split(/\s*\.\s*/);
      if (!p[0]) {
        props[p[0]] = [];
      }
      props[p[0]].push(p[1]);
    });
  }

  return (state, storename, store) => {
    const selected = {};
    const currentSelectProps = props[storename];
    if (!currentSelectProps || !currentSelectProps.length) {
      // for (const s in store) {
      //   if (!excludeProps.includes(s)) {
      //     if (typeof store[s] === 'function') {
      //       selected[s] = store.dispatch(store[s]);
      //     }
      //   }
      // }
      selected.dispatch = store.dispatch;
      selected.setState = store.setState;
      selected.getState = store.getState;
      selected.setStore = store.setStore;
      selected.getStore = store.getStore;
      selected.subscribe = store.subscribe;
      selected.unsubscribe = store.unsubscribe;

      for (const k in state) {
        selected[k] = state[k];
      }
    } else {
      for (let i = 0; i < currentSelectProps.length; i++) {
        const key = currentSelectProps[i];
        if (excludeProps.includes(key)) {
          continue;
        }
        selected[key] = state[key] || store[key];
      }
    }
    return selected;
  };
}

// Lighter Object.assign stand-in
export function assign(obj, props) {
  for (const i in props) obj[i] = props[i];
  return obj;
}
