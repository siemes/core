const mongooseIntl = require('mongoose-intl');
const options = require('./_options/info');

module.exports = function CmsModelContent(app) {
  const Plugin = app.service('Plugin');
  const { info } = app.service('config/locales/model');
  const mongoose = app.service('Mongoose');
  const { Validate } = app.service('System');
  const { locales, defaultLocale } = app.config('i18n');
  const { Schema } = mongoose;

  const schema = Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    valueIntl: { type: String, intl: true },
  }, {
    timestamps: true,
  });

  schema.set('toJSON', { virtuals: true });
  schema.set('toObject', { virtuals: true });

  schema.virtual('intl')
    .get(function () {
      return this._intl || defaultLocale;
    })
    .set(function (value) {
      this._intl = locales.includes(value) ? value : defaultLocale;
    });

  schema.pre('save', function (next) {
    if (this.isModified('value')) {
      this.set(`valueIntl.${this.intl}`, this.value);
      // this.title = undefined; // update ederken required: true hata veriyor
    }

    next();
  });

  const { adminSearch, rules } = options();
  schema.r2options = { adminSearch, attributes: info, rules };
  Validate(schema, { attributes: info, rules });

  Plugin.plugins(schema, { patchHistory: { name: 'cmsInfo' } });
  schema.plugin(mongooseIntl, { languages: locales, defaultLanguage: defaultLocale });

  return mongoose.model('cmsInfo', schema);
};
