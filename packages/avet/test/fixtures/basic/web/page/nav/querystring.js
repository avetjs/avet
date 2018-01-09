import React from 'react';
import Link from 'avet/link';

export default class AsyncProps extends React.Component {
  static async getInitialProps({ query: { id = 0 } }) {
    return { id };
  }

  render() {
    return (
      <div className="nav-querystring">
        <Link href={`/nav/querystring?id=${parseInt(this.props.id, 10) + 1}`}>
          <a id="link">Click here</a>
        </Link>
        <Link href="/nav/querystring">
          <a id="main-page">Click here</a>
        </Link>
        <p className={`nav-id-${this.props.id}`}>{this.props.id}</p>
      </div>
    );
  }
}