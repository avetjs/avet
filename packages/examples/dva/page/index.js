import React from 'react';
import dva from 'dva';

export default function () {
  const app = dva();

  app.router(() => {
    return (
      <div>
        Hi,
        <a href="/users">Go to /users</a>
      </div>
    );
  });

  const Component = app.start();

  return (
    <Component />
  );
}