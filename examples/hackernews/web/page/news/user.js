import React from 'react';
import Layout from '../../component/layout';
import { relativeTime } from '../../service/util';

export default class User extends React.Component {
  static async getInitialProps({ httpclient, query }) {
    return (await httpclient.get('/api/getNewsUser', { params: query })).data;
  }

  render() {
    const { user } = this.props;

    return (
      <Layout>
        <div className="user-view view v-transition">
          <ul>
            <li>
              <span className="label">user:</span> {user.id}
            </li>
            <li>
              <span className="label">created:</span>{' '}
              {relativeTime(user.created)}
            </li>
            <li>
              <span className="label">karma:</span> {user.karma}
            </li>
            <li>
              <span className="label">about:</span>
              <div
                className="about"
                dangerouslySetInnerHTML={{
                  __html: `
                  ${user.about}
                `,
                }}
              />
            </li>
          </ul>
          <p className="links">
            <a href={`https://news.ycombinator.com/submitted?id=${user.id}`}>
              submissions
            </a>
            <br />
            <a href={`https://news.ycombinator.com/threads?id=${user.id}`}>
              comments
            </a>
          </p>
          <style jsx>{`
            .user-view {
              color: #828282;
            }
            .user-view li {
              margin: 5px 0;
            }
            .user-view .label {
              display: inline-block;
              min-width: 60px;
            }
            .user-view .about {
              margin-top: 1em;
            }
            .user-view .links a {
              text-decoration: underline;
            }
          `}</style>
        </div>
      </Layout>
    );
  }
}
