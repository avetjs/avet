import Head from 'avet/head';
import Link from 'avet/link';

export default () => (
  <div>
    <Head>
      <title>Index Page</title>
    </Head>
    <h1>this is index page</h1>
    <Link href="/page2">
      <a>Go to Page2</a>
    </Link>
  </div>
);
