'use strict';

const app = require('egg');

class HelloController extends app.Controller {
  * index() {
    this.ctx.body = 'Hello, Welcome to use Avet and Egg!!';
  }
}

module.exports = HelloController;
