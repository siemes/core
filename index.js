const fs = require('fs');
const initMenu = require('./menu');
const initPage = require('./page');
const initMedia = require('./media');
const initInfo = require('./info');
const contentModel = require('./model/content');
const nestedModel = require('./model/nested');
const uploadCtrl = require('./base/controller/upload');
const utils = require('./base/utils');
const route = require('./base/route');

module.exports = function Cms(app) {
  if (!app.hasServices('Mongoose|Plugin|System|S3|Admin')) {
    return false;
  }

  const Utils = utils(app);

  // init base models
  contentModel(app);
  nestedModel(app);

  // init modules
  initMenu(app);
  initPage(app);
  initMedia(app);
  initInfo(app);
  Utils.initViews(__dirname); // cms views dir

  const config = app.services[`config/${app.get('env')}`];
  const pageTemplates = fs.readdirSync(`${process.cwd()}/views/page`);

  app.use((req, res, next) => {
    Object.assign(res.locals, {
      config, pageTemplates, env: app.get('env'),
    });
    next();
  });

  // controllers
  return {
    upload: uploadCtrl(app),
    route: route(app),
  };
};
