import { domain, relativeTime } from '../service/util';

export default ({ id, index, url, title, score, time, by, descendants }) => (
  <div className="item">
    <span className="index">{index}.</span>
    <p>
      <a className="title" target="_blank" href={url}>
        {title}
      </a>
      <span className="domain">({domain(url)})</span>
    </p>
    <p className="subtext">
      <span>
        {score} points by <a href={`/news/user?id=${by}`}>{by}</a>
      </span>
      {relativeTime(time)}
      <span className="comments-link">
        | <a href={`/news/detail?id=${id}`}>{descendants} comments</a>
      </span>
    </p>
    <style jsx>{`
      .item {
        padding: 2px 0 2px 40px;
        position: relative;
        -webkit-transition: background-color 0.2s ease;
        transition: background-color 0.2s ease;
      }
      .item p {
        margin: 2px 0;
      }
      .item .index,
      .item .title:visited {
        color: #828282;
      }
      .item .index {
        position: absolute;
        width: 30px;
        text-align: right;
        left: 0;
        top: 4px;
      }
      .item .domain,
      .item .subtext {
        font-size: 11px;
        color: #828282;
      }
      .item .domain a,
      .item .subtext a {
        color: #828282;
      }
      .item .subtext a:hover {
        text-decoration: underline;
      }
    `}</style>
  </div>
);
