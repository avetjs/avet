/* global describe, it, expect */

import EventEmitter from '../lib/event-emiiter';

describe('EventEmiiter', () => {
  describe('With listeners', () => {
    it('should listen to a event', done => {
      const event = new EventEmitter();
      event.on('sample', done);
      event.emit('sample');
    });

    it('should listen to multiple listeners', () => {
      const event = new EventEmitter();
      let count = 0;

      event.on('sample', () => {
        count += 1;
      });
      event.on('sample', () => {
        count += 1;
      });
      event.emit('sample');
      expect(count).toBe(2);
    });

    it('should support multiple arguments', () => {
      const event = new EventEmitter();
      let data;

      event.on('sample', (...args) => {
        data = args;
      });
      event.emit('sample', 'one', 'two');
      expect(data).toEqual([ 'one', 'two' ]);
    });

    it('should possible to stop listening an event', () => {
      const event = new EventEmitter();
      let count = 0;

      const cb = () => {
        count += 1;
      };

      event.on('sample', cb);
      event.emit('sample');
      expect(count).toBe(1);

      event.off('sample', cb);
      event.emit('sample');
      expect(count).toBe(1);
    });

    it('should throw when try to add the same listener multiple times', () => {
      const event = new EventEmitter();
      const cb = () => {};

      event.on('sample', cb);
      const run = () => event.on('sample', cb);
      expect(run).toThrow(/The listener already exising in event: sample/);
    });
  });

  describe('Without a listener', () => {
    it('should not fail to emit', () => {
      const event = new EventEmitter();
      event.emit('aaaa', 10, 20);
    });
  });
});
