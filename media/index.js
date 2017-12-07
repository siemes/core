const cmsMedia = require('./model/media');
const utils = require('../base/utils');

module.exports = function CmsCategoryService(app) {
  const Utils = utils(app);
  Utils.initViews(__dirname);
  cmsMedia(app);
};
