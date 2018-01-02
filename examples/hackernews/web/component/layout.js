import Head from 'avet/head';
import Link from 'avet/link';

export default ({ children }) => (
  <div>
    <Head>
      <meta charSet="utf-8" />
      <meta
        name="viewport"
        content="initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui"
      />
    </Head>
    <div className="wrapper">
      <div className="header">
        <a className="yc" href="http://www.ycombinator.com">
          <img src="https://news.ycombinator.com/y18.gif" alt="" />
        </a>
        <h1>
          <Link href="/news">
            <a>Hacker News</a>
          </Link>
        </h1>
        <span className="source">
          Built with{' '}
          <a
            href="https://avetjs.github.io/avet/docs/spec/introduce-cn"
            target="_blank"
            rel="noopener noreferrer"
          >
            avet
          </a>{' '}
          |{' '}
          <a
            href="https://github.com/avetjs/avet"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source
          </a>
        </span>
      </div>
      {children}
      <style jsx>{`
        .wrapper {
          background-color: #f6f6ef;
          width: 85%;
          min-height: 80px;
          margin: 0 auto;
        }
        .header,
        .wrapper {
          position: relative;
        }
        .header {
          background-color: #f60;
          height: 24px;
        }
        .header h1 {
          font-weight: 700;
          font-size: 13px;
          display: inline-block;
          vertical-align: middle;
          margin: 0;
        }
        .header .source {
          color: #fff;
          font-size: 11px;
          position: absolute;
          top: 4px;
          right: 4px;
        }
        .header .source a {
          color: #fff;
        }
        .header .source a:hover {
          text-decoration: underline;
        }
        .yc {
          border: 1px solid #fff;
          margin: 2px;
          display: inline-block;
        }
        .yc,
        .yc img {
          vertical-align: middle;
        }
      `}</style>
    </div>
  </div>
);
