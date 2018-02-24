import Store from 'avet/store';

export default class PageIndex extends Store {
  constructor(state = { count: 0 }) {
    super(state);
  }

  increment = state => {
    this.setState({ count: state.count + 1 });
  };
}
