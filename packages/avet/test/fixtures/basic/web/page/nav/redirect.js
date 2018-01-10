import Router from 'avet/router';

const Page = () => <p>This is the page</p>;

Page.getInitialProps = ctx => {
  if (ctx) {
    ctx.res.writeHead(302, { Location: '/nav/about' });
  } else {
    Router.push('/nav/about');
  }

  return {};
};

export default Page;
