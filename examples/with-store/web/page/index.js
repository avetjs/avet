import React from 'react';
import Header from '../component/header';
import IndexStore from '../store/pageindex';

class IndexPage extends React.Component {
  static async getStore() {
    const store = new IndexStore();
    return { store };
  }

  render() {
    const { store } = this.props;
    return (
      <div className="container">
        <Header />
        <button onClick={store.increment} />
        <p>click {store.count} times</p>
      </div>
    );
  }
}

export default IndexPage;
