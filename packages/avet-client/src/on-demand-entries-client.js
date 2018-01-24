/* global location */
import Router from 'avet-shared/lib/router';
import fetch from 'unfetch';

export default () => {
  Router.ready(() => {
    Router.router.events.on('routeChangeComplete', ping);
  });

  async function ping() {
    try {
      const url = `http://127.0.0.1:7010/_app/on-demand-entries-ping?page=${Router.pathname}`;
      const res = await fetch(url, {
        credentials: 'same-origin',
      });
      const payload = await res.json();
      if (payload.invalid) {
        const pageRes = await fetch(location.href, {
          credentials: 'same-origin',
        });
        if (pageRes.status === 200) {
          location.reload();
        }
      }
    } catch (err) {
      console.error(`Error with on-demand-entries-ping: ${err.message}`);
    }
  }

  async function runPinger() {
    while (true) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      await ping();
    }
  }

  runPinger().catch(err => {
    console.error(err);
  });
};
