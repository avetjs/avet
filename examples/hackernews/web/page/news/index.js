import React from 'react';
import Layout from '../../component/layout';
import NewsItem from '../../component/news-item';

export default class NewsIndex extends React.Component {
  static async getProps({ httpclient, query }) {
    return (await httpclient.get('/api/getNewsList', { params: query })).data;
  }

  render() {
    const { page, list } = this.props;

    return (
      <Layout>
        <div className="news-view view v-transition">
          {list.map(item => {
            return <NewsItem {...item} />;
          })}

          <div className="nav">
            {page > 1 && <a href={`/news?page=${page - 1}`}>&lt; prev</a>}
            <a href={`/news?page=${page + 1}`}>more...</a>
          </div>
          <style jsx>{`
            .news-view {
              padding-left: 5px;
              padding-right: 15px;
            }
            .news-view.loading:before {
              content: 'Loading...';
              position: absolute;
              top: 16px;
              left: 20px;
            }
            .news-view .nav {
              padding: 10px 10px 10px 40px;
              margin-top: 10px;
              border-top: 2px solid #f60;
            }
            .news-view .nav a {
              margin-right: 10px;
            }
            .news-view .nav a:hover {
              text-decoration: underline;
            }
          `}</style>
        </div>
      </Layout>
    );
  }
}
