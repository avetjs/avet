import React from 'react';
import Link from 'avet/link';
import Header from '../component/header';

class IndexPage extends React.Component {
  render() {
    return (
      <div className="index-container">
        <Header />
        <h1>this is pageuse</h1>
        <Link href="/page2">
          <a>go to page2</a>
        </Link>
      </div>
    );
  }
}

export default IndexPage;
