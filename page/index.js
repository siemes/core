const cmsPage = require('./model/page');
const utils = require('../base/utils');

module.exports = function CmsPostService(app) {
  const Utils = utils(app);
  Utils.initViews(__dirname);
  cmsPage(app);
};
