import React from 'react';
import Link from './link';
import Router from './router';
import { warn, execOnce } from './utils';

const warnImperativePrefetch = execOnce(() => {
  const message = '> Use "Router.prefetch(href)" instead.';
  warn(message);
});

const wantLinkPrefetch = execOnce(() => {
  const message = '> Use "<Link prefetch />" instead.';
  warn(message);
});

export function prefetch(href) {
  warnImperativePrefetch();
  return Router.prefetch(href);
}

export default class LinkPrefetch extends React.Component {
  render() {
    wantLinkPrefetch();
    const props = {
      ...this.props,
      prefetch: this.props.prefetch !== false,
    };

    return <Link {...props} />;
  }
}
