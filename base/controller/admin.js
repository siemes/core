const _ = require('underscore');

module.exports = (app) => {
  const { created } = app.handler;
  const { partial: p } = _;

  return {
    editable(req, res, next) {
      const AdminUtils = app.service('Admin').utils;
      const { errors } = AdminUtils;
      const { object, id: objectId } = req.params;
      const { name, value } = _.omit(req.body, _.isEmpty);

      AdminUtils.getModel(object).findById(objectId)
        .then((model) => {
          if (!model) {
            return p(errors, next)({ type: 'objectNotFound' });
          }

          if (req.query.type === 'sortable') {
            const intVal = parseInt(value, 10);
            const isnan = isNaN(intVal);
            model.set(name, isnan ? value : intVal);
          } else {
            model.set(name, value);
          }

          return model.save();
        })
        .then(data => created(data, res))
        .catch(err => p(errors, next)(err));
    },
  };
};
