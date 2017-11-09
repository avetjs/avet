import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'bisheng/router';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { Select, Menu, Row, Col, Icon, Button, Popover, AutoComplete, Input } from 'antd';
import GitHubButton from 'react-github-button';
import * as utils from '../utils';
import { version as avetVersion } from '../../../../package.json';

const { Option } = AutoComplete;
const searchEngine = 'Google';
const searchLink = 'https://www.google.com/#q=site:avetjs+';

export default class Header extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
  }

  state = {
    inputValue: '',
    menuVisible: false,
    menuMode: 'horizontal',
  };

  componentDidMount() {
    this.context.router.listen(this.handleHideMenu);
    const { searchInput } = this;
    /* eslint-disable global-require */
    require('enquire.js')
      .register('only screen and (min-width: 0) and (max-width: 992px)', {
        match: () => {
          this.setState({ menuMode: 'inline' });
        },
        unmatch: () => {
          this.setState({ menuMode: 'horizontal' });
        },
      });
    document.addEventListener('keyup', (event) => {
      if (event.keyCode === 83 && event.target === document.body) {
        searchInput.focus();
      }
    });
    /* eslint-enable global-require */
  }

  handleSearch = (value) => {
    if (value === searchEngine) {
      window.location.href = `${searchLink}${this.state.inputValue}`;
      return;
    }

    const { intl, router } = this.context;
    this.setState({
      inputValue: '',
    }, () => {
      router.push({ pathname: utils.getLocalizedPathname(`${value}/`, intl.locale === 'zh-CN') });
      this.searchInput.blur();
    });
  }

  handleInputChange = (value) => {
    this.setState({
      inputValue: value,
    });
  }

  handleShowMenu = () => {
    this.setState({
      menuVisible: true,
    });
  }

  handleHideMenu = () => {
    this.setState({
      menuVisible: false,
    });
  }

  onMenuVisibleChange = (visible) => {
    this.setState({
      menuVisible: visible,
    });
  }

  handleSelectFilter = (value, option) => {
    const optionValue = option.props['data-label'];
    return optionValue === searchEngine ||
      optionValue.indexOf(value.toLowerCase()) > -1;
  }

  handleLangChange = () => {
    const { pathname, basename } = this.props.location;
    const currentProtocol = `${window.location.protocol}//`;
    const currentHref = window.location.href.substr(currentProtocol.length);

    if (utils.isLocalStorageNameSupported()) {
      localStorage.setItem('locale', utils.isZhCN(pathname) ? 'en-US' : 'zh-CN');
    }

    window.location.href = currentProtocol + currentHref.replace(
      window.location.pathname,
      (basename + utils.getLocalizedPathname(pathname, !utils.isZhCN(pathname)).replace(/^\//, '')),
    );
  }

  handleVersionChange = (url) => {
    const currentUrl = window.location.href;
    const currentPathname = window.location.pathname;
    window.location.href = currentUrl.replace(window.location.origin, url)
      .replace(currentPathname, utils.getLocalizedPathname(currentPathname));
  }

  render() {
    const { inputValue, menuMode, menuVisible } = this.state;
    const {
      location, picked, isFirstScreen, themeConfig,
    } = this.props;
    const docVersions = { ...themeConfig.docVersions, [avetVersion]: avetVersion };
    const versionOptions = Object.keys(docVersions)
      .map(version => <Option value={docVersions[version]} key={version}>{version}</Option>);

    const module = location.pathname.replace(/(^\/|\/$)/g, '').split('/').slice(0, -1).join('/');
    let activeMenuItem = module || 'home';
    if (location.pathname === 'changelog') {
      activeMenuItem = 'docs/react';
    }

    const { locale } = this.context.intl;
    const isZhCN = locale === 'zh-CN';
    const excludedSuffix = isZhCN ? 'en-US.md' : 'zh-CN.md';

    const headerClassName = classNames({
      clearfix: true,
      'home-nav-white': !isFirstScreen,
    });

    const menu = [
      <div className="githubBtn">
        <GitHubButton
          key="github-button"
          type="stargazers"
          namespace="avetjs"
          repo="avet"
        />
      </div>,
      <Button className="lang" type="ghost" size="small" onClick={this.handleLangChange} key="lang">
        <FormattedMessage id="app.header.lang" />
      </Button>,
      <Menu mode={menuMode} selectedKeys={[activeMenuItem]} id="nav" key="nav">
        <Menu.Item key="home">
          <Link to={utils.getLocalizedPathname('/', isZhCN)}>
            <FormattedMessage id="app.header.menu.home" />
          </Link>
        </Menu.Item>
        <Menu.Item key="docs/spec">
          <Link to={utils.getLocalizedPathname('/docs/spec/introduce', isZhCN)}>
            <FormattedMessage id="app.header.menu.spec" />
          </Link>
        </Menu.Item>
        <Menu.Item key="docs/resource">
          <Link to={utils.getLocalizedPathname('/docs/resource/download', isZhCN)}>
            <FormattedMessage id="app.header.menu.resource" />
          </Link>
        </Menu.Item>
      </Menu>,
    ];

    const searchPlaceholder = locale === 'zh-CN' ? '搜索...' : 'Search...';

    return (
      <header id="header" className={headerClassName}>
        {menuMode === 'inline' ? (
          <Popover
            overlayClassName="popover-menu"
            placement="bottomRight"
            content={menu}
            trigger="click"
            visible={menuVisible}
            arrowPointAtCenter
            onVisibleChange={this.onMenuVisibleChange}
          >
            <Icon
              className="nav-phone-icon"
              type="menu"
              onClick={this.handleShowMenu}
            />
          </Popover>
        ) : null}
        <Row>
          <Col lg={4} md={5} sm={24} xs={24}>
            <Link to={utils.getLocalizedPathname('/', isZhCN)} id="logo">
              <span>Avet</span>
            </Link>
          </Col>
          <Col lg={20} md={19} sm={0} xs={0}>
            <div id="search-box">
              <AutoComplete
                value={inputValue}
                dropdownClassName="component-select"
                placeholder={searchPlaceholder}
                optionLabelProp="data-label"
                filterOption={this.handleSelectFilter}
                onSelect={this.handleSearch}
                onSearch={this.handleInputChange}
                getPopupContainer={trigger => trigger.parentNode}
              >
                <Input ref={ref => this.searchInput = ref} />
              </AutoComplete>
            </div>
            {menuMode === 'horizontal' ? menu : null}
          </Col>
        </Row>
      </header>
    );
  }
}
