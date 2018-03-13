import Store from 'avet/store';

export default class CurrentIndex extends Store {
  constructor(
    state = {
      current: 1,
    }
  ) {
    super(state);
  }

  setCurrent(state, current) {
    this.setState({ current });
  }
}
