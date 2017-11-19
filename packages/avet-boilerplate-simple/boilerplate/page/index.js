import React from 'react';
import Header from '../component/header';

class IndexPage extends React.Component {
  render() {
    return (
      <div className="index-container">
        <Header></Header>
        <h1>this is pageuse</h1>
        <a href="/page2">go to page2</a>
      </div>
    )
  }
}

export default IndexPage;
