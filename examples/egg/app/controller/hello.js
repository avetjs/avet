const { Controller } = require('egg');

class HelloController extends Controller {
  index() {
    this.ctx.body = 'Hello, Welcome to use Avet!!';
  }
}

module.exports = HelloController;
