import { Application } from 'avet';

export default (app: Application) => {
  const { router, controller } = app;
  router.get('/api/getNewsList', controller.news.list);
};
