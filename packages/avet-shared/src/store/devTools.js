import { isServer } from 'avet-utils/lib/common';

export default function devTools(store) {
  if (isServer()) {
    return store;
  }

  const extension = window.devToolsExtension || window.top.devToolsExtension;
  let ignoreState = false;

  if (!extension) {
    console.warn('Please install/enable Redux devtools extension');
    store.devtools = null;

    return store;
  }

  if (!store.devtools) {
    store.devtools = extension.connect();
    store.devtools.subscribe(message => {
      if (message.type === 'DISPATCH' && message.state) {
        ignoreState =
          message.payload.type === 'JUMP_TO_ACTION' ||
          message.payload.type === 'JUMP_TO_STATE';
        store.setState(JSON.parse(message.state), true);
      }
    });
    store.devtools.init(store.getState());
    store.subscribe((state, action) => {
      const actionName = (action && action.name) || 'setState';

      if (!ignoreState) {
        store.devtools.send(actionName, state);
      } else {
        ignoreState = false;
      }
    });
  }

  return store;
}
