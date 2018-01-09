const { Controller } = require('avet');

class HelloController extends Controller {
  index() {
    this.ctx.body = 'Hello, Welcome to Avet!';
  }
}

module.exports = HelloController;
