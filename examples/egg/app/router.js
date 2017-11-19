'use strict';

module.exports = app => {
  app.get('/api/getHello', 'hello.index');
};
