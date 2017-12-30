const { Controller } = require('avet');

class NewsController extends Controller {
  async list() {
    const { ctx, app } = this;
    const { pageSize } = app.config.news;
    const page = parseInt(ctx.query.page, 10) || 1;

    const idList = await ctx.service.hackerNews.getTopStories(page);

    // get itemInfo parallel
    const newsList = await Promise.all(
      idList.map(id => ctx.service.hackerNews.getItem(id))
    );

    ctx.body = { list: newsList, page, pageSize };
  }

  async detail() {
    const { ctx } = this;
    const { id } = ctx.query;
    const newsInfo = await ctx.service.hackerNews.getItem(id);
    // get comment parallel
    const commentList = await Promise.all(
      newsInfo.kids.map(id => ctx.service.hackerNews.getItem(id))
    );

    ctx.body = {
      item: newsInfo,
      comments: commentList,
    };
  }

  async user() {
    const { ctx } = this;
    const { id } = ctx.query;
    const userInfo = await ctx.service.hackerNews.getUser(id);
    ctx.body = { user: userInfo };
  }
}

module.exports = NewsController;
