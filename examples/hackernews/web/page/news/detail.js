import React from 'react';
import Layout from '../../component/layout';
import NewsItem from '../../component/news-item';
import { relativeTime } from '../../service/util';

export default class Detail extends React.Component {
  static async getProps({ httpclient, query }) {
    return (await httpclient.get('/api/getNewsDetail', { params: query })).data;
  }

  render() {
    const { comments, item } = this.props;

    return (
      <Layout>
        <div className="item-view view v-transition">
          <NewsItem {...item} />
          {comments.length ? (
            <ul className="comments">
              {comments.map(comment => {
                return (
                  <li>
                    <div className="comhead">
                      <a className="toggle">[-]</a>
                      <a href={`/news/user/${comment.by}`}>{comment.by}</a>
                      {relativeTime(comment.time)}
                    </div>
                    <div
                      className="comment-content"
                      dangerouslySetInnerHTML={{
                        __html: `
                          ${comment.text}
                        `,
                      }}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No comments yet.</p>
          )}
          <style jsx>{`
            .item-view .item {
              padding-left: 0;
              margin-bottom: 30px;
            }
            .item-view .item .index {
              display: none;
            }
            .item-view .poll-options {
              margin-left: 30px;
              margin-bottom: 40px;
            }
            .item-view .poll-options li {
              margin: 12px 0;
            }
            .item-view .poll-options p {
              margin: 8px 0;
            }
            .item-view .poll-options .subtext {
              color: #828282;
              font-size: 11px;
            }
            .item-view .itemtext {
              color: #828282;
              margin-top: 0;
              margin-bottom: 30px;
            }
            .item-view .itemtext p {
              margin: 10px 0;
            }
            .comhead {
              font-size: 11px;
              margin-bottom: 8px;
            }
            .comhead,
            .comhead a {
              color: #828282;
            }
            .comhead a:hover {
              text-decoration: underline;
            }
            .comhead .toggle {
              margin-right: 4px;
            }
            .comment-content {
              margin: 0 0 16px 24px;
              word-wrap: break-word;
            }
            .comment-content code {
              white-space: pre-wrap;
            }
          `}</style>
        </div>
      </Layout>
    );
  }
}
