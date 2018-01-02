module.exports = app => {
  const { router, controller } = app;
  router.get('/api/getNewsList', controller.news.list);
  router.get('/api/getNewsDetail', controller.news.detail);
  router.get('/api/getNewsUser', controller.news.user);
};
