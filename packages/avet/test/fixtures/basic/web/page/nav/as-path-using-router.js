import React from 'react';
import Router from 'avet/router';

export default class extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  componentDidMount() {
    const { asPath } = Router;
    this.setState({ asPath });
  }

  render() {
    return <div className="as-path-content">{this.state.asPath}</div>;
  }
}
