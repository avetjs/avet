// this is a unit test env
exports.app = {
  staticOptions: {
    maxAge: 0,
    buffer: false,
    gzip: false,
  },
};

exports.build = {
  onDemandEntries: {
    // 单元测试环境设置一个比较长的页面过期时间
    maxInactiveAge: 1000 * 1800,
  },
};
