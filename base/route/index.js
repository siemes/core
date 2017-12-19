const session = require('cookie-session');
const flash = require('connect-flash');
const async = require('async');
const _ = require('underscore');
const uploadCtrl = require('../controller/upload');
const adminCtrl = require('../controller/admin');
const handlePath = require('./middleware/handlePath');
const handleParams = require('./middleware/handleParams');
const handleRoute = require('./middleware/handleRoute');

module.exports = (app) => {
  const {
    name = 'cms',
    secret = 'cms',
    maxAge = 7 * 24 * 60 * 60 * 1000, // 7 days
  } = app.config('session') || {};

  const cmsConf = app.config('i18n');
  const mContent = app.service('Mongoose').model('cmsContent');
  const mPage = app.service('Mongoose').model('cmsPage');
  const upload = uploadCtrl(app);
  const admin = adminCtrl(app);

  // dynamic params --------------------------

  const { defaultLocale, forceLang = false } = cmsConf;
  const langParam = `/:lang(${cmsConf.locales.join('|')})`;

  const paths = {
    '/': {
      tmpl: 'index.html',
      name: 'base',
    },
    [langParam]: {
      tmpl: 'index.html',
      params: ['lang'],
      name: 'langBase',
    },
    [`${langParam}/:dontParseCategorySlug*/:contentSlug--:contentShortId?`]: {
      params: ['lang', 'dontParseCategorySlug', 'contentSlug', 'contentShortId'],
    },
    [`${langParam}/:contentSlug--:contentShortId?`]: {
      params: ['lang', 'contentSlug', 'contentShortId'],
    },
    [`${langParam}/:page*`]: {
      params: ['lang', 'page'],
    },
    '/:dontParseCategorySlug*/:contentSlug--:contentShortId?': {
      params: ['dontParseCategorySlug', 'contentSlug', 'contentShortId'],
    },
    '/:contentSlug--:contentShortId?': {
      params: ['contentSlug', 'contentShortId'],
    },
    '/:page*': {
      params: ['page'],
    },
    '*': {
      tmpl: '404.html',
      name: '404',
    },
  };

  const paramsList = {
    contentSlug: (params) => {
      const { lang, contentSlug, contentShortId: shortId } = params;
      const q = lang ? { [`slugPathIntl.${lang}`]: contentSlug } : { [`slugPathIntl.${defaultLocale}`]: contentSlug };
      Object.assign(q, { shortId });
      return async.asyncify(() => mContent.findOne(q));
    },
    page: (params) => {
      const { lang, page } = params;
      const q = lang ? { [`slugPathIntl.${lang}`]: page } : { [`slugPathIntl.${defaultLocale}`]: page };
      return async.asyncify(() => mPage.findOne(q));
    },
  };

  // init --------------------------

  const init = () => {
    // upload endpoints
    app.service('Admin').router.post('/cms/upload/s3sign', upload.sign);
    app.service('Admin').router.post('/cms/upload/complete', upload.complete);
    app.service('Admin').router.post('/:object/:id/editable', admin.editable);

    app.use(session({ name, secret, maxAge }));
    app.use(flash());

    const pathsObj = {};
    _.each(paths, (val, key) => {
      pathsObj[key] = 1;
    });

    app.use(handlePath(paths, pathsObj));
    app.use(handleParams(paramsList));
    handleRoute(app, defaultLocale, forceLang);
  };

  return {
    init,
  };
};
