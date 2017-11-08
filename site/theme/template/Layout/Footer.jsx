import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Modal, Icon, message } from 'antd';
import { isLocalStorageNameSupported, loadScript } from '../utils';

class Footer extends React.Component {
  constructor(props) {
    super(props);

    this.lessLoaded = false;

    this.state = {
      color: '#108ee9',
    };
  }

  render() {
    return (
      <footer id="footer">
        <ul>
          <li>
            <h2><Icon type="github" /> Avet</h2>
            <div>
              <a target="_blank " href="https://github.com/avetjs/avet">
                GitHub
              </a>
            </div>
          </li>
          <li>
            <h2><Icon type="link" /> <FormattedMessage id="app.footer.resources" /></h2>
            <div>
              <a target="_blank" rel="noopener noreferrer" href="https://eggjs.org/">Egg</a>
              <span> - </span>
              <FormattedMessage id="app.footer.eggjs" />
            </div>
            <div>
              <a target="_blank" rel="noopener noreferrer" href="https://github.com/zeit/next.js/">Next.js</a>
              <span> - </span>
              <FormattedMessage id="app.footer.nextjs" />
            </div>
          </li>
          <li>
            <h2><Icon type="customer-service" /> <FormattedMessage id="app.footer.community" /></h2>
            <div>
              <a href="/changelog">
                <FormattedMessage id="app.footer.change-log" />
              </a>
            </div>
            <div>
              <a target="_blank" rel="noopener noreferrer" href="https://github.com/avetjs/avet/issues">
                <FormattedMessage id="app.footer.issues" />
              </a>
            </div>
            <div>
              <a target="_blank" rel="noopener noreferrer" href="http://stackoverflow.com/questions/tagged/avet">
                <FormattedMessage id="app.footer.stackoverflow" />
              </a>
            </div>
          </li>
          <li>
            <h2>Copyright © {new Date().getFullYear()}</h2>
            <div>
              <FormattedMessage id="app.footer.author" />
            </div>
            <div>
              Built with&nbsp;
              <a target="_blank" rel="noopener noreferrer" href="https://github.com/benjycui/bisheng">
                BiSheng
              </a>
            </div>
          </li>
        </ul>
      </footer>
    );
  }
}

export default injectIntl(Footer);
