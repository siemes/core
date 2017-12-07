module.exports = (app, defaultLocale) => {
  app.get('*', (req, res, next) => {
    const { page, contentSlug } = req.paramsData;
    const { value = {} } = req.handlePath;
    let routeData = {};

    if (page) {
      routeData = page || {};
    } else {
      routeData = contentSlug || {};
    }

    const tmpl = routeData.template || value.tmpl;

    if (!tmpl) {
      return next('route');
    }

    // set language
    if (!req.handleParams) {
      req.handleParams = { lang: defaultLocale };
    } else if (!req.handleParams.lang) {
      req.handleParams.lang = defaultLocale;
    }

    return res.render(`page/${tmpl}`, {
      handlePath: req.handlePath,
      handleParams: req.handleParams,
      paramsData: req.paramsData,
      query: req.query,
      session: req.session,
      routeData,
    });
  });

  app.all('*', (req, res) => {
    res.render('404.html');
  });
};
