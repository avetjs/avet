import Store from 'avet/store';

export default class PageIndex extends Store {
  constructor(
    state = {
      count: 0,
      totalPage: 0,
    }
  ) {
    super(state);
  }

  increment(state) {
    this.setState({ count: state.count + 1 });
  }

  dynamicLoad(state) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ totalPage: state.totalPage + 4 });
      }, 5000);
    });
  }
}
