const options = require('./_options/media');

module.exports = (app) => {
  const { media } = app.service('config/locales/model');
  const mongoose = app.service('Mongoose');
  const { Validate } = app.service('System');
  const { Schema } = mongoose;

  const schema = Schema({
    itemType: { type: String, enum: ['folder', 'file'] },
    size: { type: Number, default: 0 },
    humanSize: { type: String },
    uuid: { type: String },
    mime: { type: String },
    fullPath: { type: String },
  }, {
    timestamps: true,
  });

  schema.set('toJSON', { virtuals: true });
  schema.set('toObject', { virtuals: true });

  const { adminSearch, rules } = options();
  schema.r2options = { adminSearch, attributes: media, rules };
  Validate(schema, { attributes: media, rules });

  const Content = app.service('Mongoose').model('cmsContent');
  return Content.discriminator('cmsMedia', schema);
};
