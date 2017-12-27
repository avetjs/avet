import React from 'react';
import Header from '../component/header';

class IndexPage extends React.Component {
  static async getInitialProps() {
    // const res = await httpclient.get('/api/getHello');
    return { hello: '' };
  }

  render() {
    return (
      <div className="index-container">
        <Header />
        <h1>hello00</h1>
        <p>{this.props.hello}</p>
      </div>
    );
  }
}

export default IndexPage;
