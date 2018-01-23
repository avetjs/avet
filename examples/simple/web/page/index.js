import React from 'react';
import Header from '../component/header';

class IndexPage extends React.Component {
  static async getInitialProps({ httpclient }) {
    const res = await httpclient.get('/api/getHello');
    return { hello: res.data };
  }

  render() {
    return (
      <div className="index-container">
        <Header />
        <h1>hello test workssssssssssss</h1>
        <p>{this.props.hello}</p>
      </div>
    );
  }
}

export default IndexPage;
