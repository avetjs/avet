import React from 'react';
import Header from '../component/header';
import IndexStore from '../store/pageindex';
import CurrentStore from '../store/current';

class IndexPage extends React.Component {
  static async getProps() {
    return { title: 'hello worldssss' };
  }

  static async getStore() {
    const indexStore = new IndexStore();
    const currentStore = new CurrentStore();
    await indexStore.dispatch('dynamicLoad');
    return { indexStore, currentStore };
  }

  render() {
    const { indexStore, currentStore, title } = this.props;
    return (
      <div className="container">
        <Header title={title} />
        <button
          onClick={() => {
            indexStore.dispatch('increment');
          }}
        />
        <p>click {indexStore.count} times</p>
        <p>totalPage: {indexStore.totalPage}</p>
        <p>deepObject: {indexStore.getState('deepobject.a')}</p>
        <p>current: {currentStore.current}</p>
      </div>
    );
  }
}

export default IndexPage;
