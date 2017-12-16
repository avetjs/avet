import React from 'react';

export default class View extends React.Component {
  static doctype = '<!DOCTYPE html>';

  render() {
    return <ul>{items()}</ul>;
  }
}

const items = () => {
  const out = new Array(10000);
  for (let i = 0; i < out.length; i++) {
    out[i] = <li key={i}>This is row {i + 1}</li>;
  }
  return out;
};
