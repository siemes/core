const cmsMenu = require('./model/menu');
const utils = require('../base/utils');

module.exports = function CmsCategoryService(app) {
  const Utils = utils(app);
  Utils.initViews(__dirname);
  cmsMenu(app);
};
