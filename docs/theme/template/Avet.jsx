import React from 'react';
import { Link } from 'react-router';

export default function Avet() {
  return <div className="cover-wrapper">
    <div className="cover-content">
      <h3>Avet</h3>
      <p className="slogan">
        Make Avet Great Again
      </p>
      <div className="cover-link">
        <a className="github" href="https://github.com/avetjs/avet" target="_blank">GitHub</a>
        &nbsp;&nbsp;
        <Link className="start" to="/docs/spec/introduce" >Get Started</Link>
      </div>
    </div>
  </div>;
}