import React from 'react';
import Header from '../component/header';
import IndexStore from '../store/pageindex';

class IndexPage extends React.Component {
  static async getProps() {
    return { title: 'hello world' };
  }

  static async getStore() {
    const store = new IndexStore();
    await store.action('dynamicLoad');
    return { store };
  }

  render() {
    const { store, title } = this.props;
    return (
      <div className="container">
        <Header title={title} />
        <button onClick={store.increment} />
        <p>click {store.count} times</p>
        <p>totalPage: {store.totalPage}</p>
      </div>
    );
  }
}

export default IndexPage;
