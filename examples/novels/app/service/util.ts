import { Service } from 'avet';
import { createReadStream } from 'fs';

/**
 * Util Api Service
 */
class Util extends Service {
  async getRandomUserAgent() {
    return new Promise((resolve, reject) => {
      const { userAgentFile } = this.ctx.app.config;
      const ws = createReadStream(userAgentFile);
      const ret = [];

      ws.on('data', data => {
        ret.push(data);
      });

      ws.on('end', () => {
        resolve(ret);
      });

      ws.on('error', reject);
    });
  }

  getRandomOne(arr) {
    if (!arr) return null;
    const len = arr.length;
    const idx = Math.floor(Math.random() * len);
    return arr[idx];
  }
}

export default Util;
