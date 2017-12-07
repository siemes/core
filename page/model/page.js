const options = require('./_options/page');

module.exports = (app) => {
  const { page } = app.service('config/locales/model');
  const mongoose = app.service('Mongoose');
  const { Validate } = app.service('System');
  const { Schema } = mongoose;
  const { ObjectId } = mongoose.Schema.Types;

  const schema = Schema({
    status: { type: String, enum: ['draft', 'published', 'archived'], field: 'select' },
    postCategories: [{ type: ObjectId, ref: 'cmsCategory' }],
  }, {
    timestamps: true,
  });

  schema.set('toJSON', { virtuals: true, getters: true });
  schema.set('toObject', { virtuals: true, getters: true });

  const { adminSearch, rules } = options();
  schema.r2options = { adminSearch, attributes: page, rules };
  Validate(schema, { attributes: page, rules });

  const Content = app.service('Mongoose').model('cmsContent');
  return Content.discriminator('cmsPage', schema);
};
