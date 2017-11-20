const path = require('path');
const { AvetCore } = require('avet-core');
const Messenger = require('./core/messenger');

const AVET_PATH = Symbol.for('avet#avetPath');

class Agent extends AvetCore {
  constructor(options = {}) {
    options.type = 'agent';

    super(options);

    this.messenger = new Messenger();

    this._wrapMessenger();

    this.loader.loadPlugin();
    this.loader.loadConfig();
    this.loader.loadCustomApp();
    this.loader.loadExtend();

    // keep agent alive even it don't have any io tasks
    setInterval(() => {}, 24 * 60 * 60 * 1000);

    this._uncaughtExceptionHandler = this._uncaughtExceptionHandler.bind(this);
    process.on('uncaughtException', this._uncaughtExceptionHandler);
  }

  _uncaughtExceptionHandler(err) {
    if (!(err instanceof Error)) {
      err = new Error(String(err));
    }
    /* istanbul ignore else */
    if (err.name === 'Error') {
      err.name = 'unhandledExceptionError';
    }
    console.error(err);
  }

  get [AVET_PATH]() {
    return path.join(__dirname, '..');
  }

  _wrapMessenger() {
    for (const methodName of [
      'broadcast',
      'sendTo',
      'sendToApp',
      'sendToAgent',
      'sendRandom',
    ]) {
      wrapMethod(methodName, this.messenger);
    }

    function wrapMethod(methodName, messenger) {
      const originMethod = messenger[methodName];
      messenger[methodName] = function(...args) {
        const stack = new Error().stack
          .split('\n')
          .slice(1)
          .join('\n');
        console.warn(
          "agent can't call %s before server started\n%s",
          methodName,
          stack
        );
        originMethod.apply(this, args);
      };
      messenger.once('egg-ready', () => {
        messenger[methodName] = originMethod;
      });
    }
  }

  close() {
    process.removeListener('uncaughtException', this._uncaughtExceptionHandler);
    return super.close();
  }
}

module.exports = Agent;
