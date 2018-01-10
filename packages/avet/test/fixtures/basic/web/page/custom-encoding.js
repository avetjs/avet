import React from 'react';

export default class extends React.Component {
  static async getInitialProps({ ctx }) {
    if (ctx) {
      ctx.set('Content-Type', 'text/html; charset=iso-8859-2');
    }
    return {};
  }

  render() {
    return null;
  }
}
