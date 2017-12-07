const async = require('async');
const _ = require('underscore');

module.exports = paramsList => (
  (req, res, next) => {
    req.paramsData = {};

    if (!req.handleParams) {
      return next();
    }

    const asyncParams = {};
    _.each(req.handleParams, (value, param) => {
      if (paramsList[param]) {
        asyncParams[param] = paramsList[param](req.handleParams, value);
      }
    });

    if (!Object.keys(asyncParams).length) {
      return next();
    }

    return async.parallel(asyncParams, (err, results) => {
      req.paramsData = results || {};
      next();
    });
  }
);
