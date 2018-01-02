module.exports = appInfo => {
  const config = {};

  // should change to your own
  config.keys = `${appInfo.name}123456`;

  config.news = {
    pageSize: 30,
    serverUrl: 'https://hacker-news.firebaseio.com/v0',
  };

  return config;
};
