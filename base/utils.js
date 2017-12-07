module.exports = (app) => {
  return {
    initViews(dirName) {
      // set views directory
      const viewsPath = `${dirName}/views`;
      let views = app.get('views');
      views = toString.call(views) === '[object String]' ? [views] : views;
      views = views.concat([viewsPath]);
      app.set('views', views);
    },
  };
};
