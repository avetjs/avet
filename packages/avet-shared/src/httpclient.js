import axios from 'axios';
import { isServer } from 'avet-utils';

function getBaseURL(ctx) {
  if (isServer() && ctx) {
    let port = '7001';
    if (process.env.NODE_ENV === 'production' && process.env.PORT) {
      port = process.env.PORT;
    }
    return `http://127.0.0.1:${port}`;
  } else {
    return document.location.origin;
  }
}

export function getHttpClient(ctx, options = {}) {
  if (isServer() && ctx) {
    const { headers } = ctx.request;
    Object.keys(headers).forEach(key => {
      axios.defaults.headers.common[key] = headers[key];
    });

    // 设置 ip
    if (ctx.ip) {
      axios.defaults.headers.common['X-Forwarded-For'] = ctx.ip;
    }
  }

  const baseURL = getBaseURL(ctx);
  axios.defaults.baseURL = baseURL;

  Object.assign(axios, options);

  return axios;
}

export default getHttpClient();
