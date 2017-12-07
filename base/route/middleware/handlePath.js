const handlePath = require('handle-path');
const _ = require('underscore');

module.exports = (paths, pathsObj) => (
  (req, res, next) => {
    req.handlePath = handlePath(req.path, pathsObj) || {};
    const { pattern, params } = req.handlePath;
    const matchedPath = paths[pattern];

    if (matchedPath) {
      Object.assign(req.handlePath, { value: matchedPath });

      if (matchedPath.params && params.length) {
        req.handleParams = _.object(matchedPath.params, params);
      }
    }

    next();
  }
);
