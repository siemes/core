const cmsInfo = require('./model/info');
const utils = require('../base/utils');

module.exports = function CmsInfoService(app) {
  const Utils = utils(app);
  Utils.initViews(__dirname);
  cmsInfo(app);
};
