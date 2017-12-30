import * as React from 'react';
import Error from 'avet/error';

export default class CustomError extends React.Component {
  static async getInitialProps({ ctx, err }) {
    if (ctx) {
      if (ctx.path === '/') {
        ctx.redirect('/news');
      }
    }

    const statusCode = ctx ? ctx.status : err ? err.statusCode : null;
    return { statusCode };
  }

  render() {
    return (
      <div>
        {this.props.statusCode && <Error statusCode={this.props.statusCode} />}
      </div>
    );
  }
}
