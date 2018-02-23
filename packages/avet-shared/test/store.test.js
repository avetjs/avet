import React, { Component } from 'react';
import TestUtils from 'react-dom/test-utils';
import PropTypes from 'prop-types';
import Store, { Provider, connect } from '../lib/store';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

const sleep = ms => new Promise(r => setTimeout(r, ms));

describe('new Store()', () => {
  it('should be instantiable', () => {
    const store = new Store();
    expect(store).toMatchObject({
      setState: expect.any(Function),
      getState: expect.any(Function),
      subscribe: expect.any(Function),
      unsubscribe: expect.any(Function),
    });
  });
  it('should update state in-place', () => {
    const store = new Store();
    expect(store.getState()).toMatchObject({});
    store.setState({ a: 'b' });
    expect(store.getState()).toMatchObject({ a: 'b' });
    store.setState({ c: 'd' });
    expect(store.getState()).toMatchObject({ a: 'b', c: 'd' });
    store.setState({ a: 'x' });
    expect(store.getState()).toMatchObject({ a: 'x', c: 'd' });
    store.setState({ c: null });
    expect(store.getState()).toMatchObject({ a: 'x', c: null });
    store.setState({ c: undefined });
    expect(store.getState()).toMatchObject({ a: 'x', c: undefined });
  });
  it('should invoke subscriptions', () => {
    const store = new Store();
    const sub1 = jest.fn();
    const sub2 = jest.fn();
    const rval = store.subscribe(sub1);
    expect(rval).toBeInstanceOf(Function);
    store.setState({ a: 'b' });
    expect(sub1).toHaveBeenCalledTimes(1);
    expect(sub1).toHaveBeenCalledWith(store.getState(), undefined);
    store.subscribe(sub2);
    store.setState({ c: 'd' });
    expect(sub1).toHaveBeenCalledTimes(2);
    expect(sub1).toHaveBeenLastCalledWith(store.getState(), undefined);
    expect(sub2).toBeCalledWith(store.getState(), undefined);
  });
  it('should unsubscribe', () => {
    const store = new Store();
    const sub1 = jest.fn();
    const sub2 = jest.fn();
    const sub3 = jest.fn();
    store.subscribe(sub1);
    store.subscribe(sub2);
    const unsub3 = store.subscribe(sub3);
    store.setState({ a: 'b' });
    expect(sub1).toBeCalled();
    expect(sub2).toBeCalled();
    expect(sub3).toBeCalled();
    sub1.mockReset();
    sub2.mockReset();
    sub3.mockReset();
    store.unsubscribe(sub2);
    store.setState({ c: 'd' });
    expect(sub1).toBeCalled();
    expect(sub2).not.toBeCalled();
    expect(sub3).toBeCalled();
    sub1.mockReset();
    sub2.mockReset();
    sub3.mockReset();
    store.unsubscribe(sub1);
    store.setState({ e: 'f' });
    expect(sub1).not.toBeCalled();
    expect(sub2).not.toBeCalled();
    expect(sub3).toBeCalled();
    sub3.mockReset();
    unsub3();
    store.setState({ g: 'h' });
    expect(sub1).not.toBeCalled();
    expect(sub2).not.toBeCalled();
    expect(sub3).not.toBeCalled();
  });
});

describe('<Provider>', () => {
  const createChild = (storeKey = 'store') => {
    class Child extends Component {
      render() {
        return <div />;
      }
    }

    Child.contextTypes = {
      [storeKey]: PropTypes.object.isRequired,
    };

    return Child;
  };
  const Child = createChild();

  it('should provide props into context', () => {
    const store = new Store();

    const spy = jest.spyOn(console, 'error');
    const tree = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Child />
      </Provider>
    );
    expect(spy).not.toHaveBeenCalled();

    const child = TestUtils.findRenderedComponentWithType(tree, Child);
    expect(child.context.store).toBe(store);
  });

  it('should pass mapped state as props', () => {
    const state = { a: 'b' };
    const store = { subscribe: jest.fn(), getState: () => state };
    const ConnectedChild = connect(Object)(Child);

    const mountedProvider = mount(
      <Provider store={store}>
        <ConnectedChild />
      </Provider>
    );

    const child = mountedProvider.find(Child).first();
    expect(child.props()).toEqual({
      a: 'b',
      store,
    });
    expect(store.subscribe).toBeCalled();
  });

  it('should transform string selector', () => {
    const state = { a: 'b', b: 'c', c: 'd' };
    const store = { subscribe: jest.fn(), getState: () => state };
    const ConnectedChild = connect('a, b')(Child);
    const mountedProvider = mount(
      <Provider store={store}>
        <ConnectedChild />
      </Provider>
    );

    const child = mountedProvider.find(Child).first();
    expect(child.props()).toEqual({
      a: 'b',
      b: 'c',
      store,
    });
    expect(store.subscribe).toBeCalled();
  });

  it('should subscribe to store', async () => {
    const store = new Store();
    jest.spyOn(store, 'subscribe');
    jest.spyOn(store, 'unsubscribe');

    const ConnectedChild = connect(Object)(Child);

    expect(store.subscribe).not.toHaveBeenCalled();
    const mountedProvider = mount(
      <Provider store={store}>
        <ConnectedChild />
      </Provider>
    );

    expect(store.subscribe).toBeCalledWith(expect.any(Function));

    let child = mountedProvider
      .find('Child')
      .first()
      .instance();
    expect(child.props).toEqual({ store });

    store.setState({ a: 'b' });
    await sleep(1);

    child = mountedProvider
      .find('Child')
      .first()
      .instance();
    expect(child.props).toEqual({ a: 'b', store });

    expect(store.unsubscribe).not.toHaveBeenCalled();
    mountedProvider.unmount();
    expect(store.unsubscribe).toBeCalled();
  });
});

describe('smoke test', () => {
  it('should render', done => {
    const actions = ({ getState, setState }) => ({
      incrementTwice(state) {
        setState({ count: state.count + 1 });
        return new Promise(r =>
          setTimeout(() => {
            r({ count: getState().count + 1 });
          }, 20)
        );
      },
    });
    const App = connect('count', actions)(({ count, incrementTwice }) => (
      <button id="some_button" onClick={incrementTwice}>
        count: {count}
      </button>
    ));
    const store = new Store({ count: 0 });
    const provider = (
      <Provider store={store}>
        <App />
      </Provider>
    );
    const mountedProvider = mount(provider);
    expect(store.getState()).toEqual({ count: 0 });
    const button = mountedProvider.find('#some_button').simulate('click');
    expect(store.getState()).toEqual({ count: 1 });
    setTimeout(() => {
      expect(store.getState()).toEqual({ count: 2 });
      expect(button.text()).toBe('count: 2');
      done();
    }, 30);
  });
});
