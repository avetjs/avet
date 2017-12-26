const { Controller } = require('egg');

class HelloController extends Controller {
  index() {
    this.ctx.body = 'Hello, Welcome to use Avet and Egg!!';
  }
}

module.exports = HelloController;
