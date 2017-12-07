const mongooseIntl = require('mongoose-intl');
const material = require('mongoose-materialized');
const slugPlugin = require('speakingurl');
const shortid = require('shortid');
const async = require('async');
const options = require('./_options/nested');

module.exports = function CmsModelNested(app) {
  const Plugin = app.service('Plugin');
  const mongoose = app.service('Mongoose');
  const { locales, defaultLocale } = app.config('i18n');
  const { Schema } = mongoose;
  const { ObjectId } = mongoose.Schema.Types;

  // TODO: profile ekle
  const schema = Schema({
    parentId: { type: ObjectId, ref: 'cmsNested' },
    name: { type: String, required: true },
    nameIntl: { type: String, intl: true },
    namePathIntl: { type: String, intl: true },
    slug: { type: String },
    slugIntl: { type: String, intl: true },
    slugPathIntl: { type: String, intl: true },
    template: { type: String, field: 'select' },
    shortId: { type: String, default: shortid.generate },
  }, {
    timestamps: true,
    discriminatorKey: 'kind',
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

  schema.pre('validate', function (next) {
    if (this.isModified('parentId')) {
      if (this.parentId.toString() === this._id.toString()) {
        // Kendisi üst kategori olarak seçilemez
        this.invalidate('parentId', 'A category cannot be chosen as its own parent.');
        return next();
      }

      return app.service('Mongoose').model('cmsNested').findById(this.parentId)
        .then((data) => {
          if (data.path.includes(this._id.toString())) {
            // Kendi alt kategorisi üst kategori olarak seçilemez
            this.invalidate('parentId', 'A category cannot be chosen as its own children.');
          }

          next();
        })
        .catch(() => next());
    }

    return next();
  });

  schema.pre('save', function (next) {
    if (this.isModified('name')) {
      this.set(`nameIntl.${this.intl}`, this.name);
      // this.name = undefined; // update ederken required: true hata veriyor

      const slug = slugPlugin(this.name, { lang: this.intl });
      this.set(`slugIntl.${this.intl}`, slug);
      this.slug = undefined;
      this._slugModified = true;
    }

    this._parentIdModified = this.isModified('parentId');
    next();
  });

  const updateChildsSlug = (data) => {
    app.service('Mongoose').model('cmsNested').find({
      path: new RegExp(`^${data.path},${data._id.toString()}`, 'g'),
    }).exec((err, docs) => {
      async.mapLimit(docs, 5, function (doc, cbNext) {
        doc.getAncestors(function (errAncestors, ancestors) {
          const slugPath = ancestors ? ancestors.map(nested => nested.get(`slugIntl.${doc.intl}`)).join('/') : '';
          const docSlug = doc.get(`slugIntl.${doc.intl}`);
          const slugPathVal = slugPath ? `${slugPath}/${docSlug}` : docSlug;

          const namePath = ancestors ? ancestors.map(nested => nested.get(`nameIntl.${doc.intl}`)).join('|') : '';
          const docName = doc.get(`nameIntl.${doc.intl}`);
          const namePathVal = namePath ? `${namePath}|${docName}` : docName;

          doc.update({
            [`slugPathIntl.${doc.intl}`]: slugPathVal,
            [`namePathIntl.${doc.intl}`]: namePathVal,
          }).then(() => cbNext()).catch(() => cbNext());
        });
      }, function () {});
    });
  };

  schema.post('save', function (doc) {
    if (this._parentIdModified || this._slugModified) {
      doc.getAncestors(function (err, docs) {
        const slugPath = docs ? docs.map(nested => nested.get(`slugIntl.${doc.intl}`)).join('/') : '';
        const docSlug = doc.get(`slugIntl.${doc.intl}`);
        const slugPathVal = slugPath ? `${slugPath}/${docSlug}` : docSlug;

        const namePath = docs ? docs.map(nested => nested.get(`nameIntl.${doc.intl}`)).join('|') : '';
        const docName = doc.get(`nameIntl.${doc.intl}`);
        const namePathVal = namePath ? `${namePath}|${docName}` : docName;

        doc.update({
          [`slugPathIntl.${doc.intl}`]: slugPathVal,
          [`namePathIntl.${doc.intl}`]: namePathVal,
        })
          .then(() => updateChildsSlug(doc))
          .catch();
      });
    }
  });

  const { adminSearch } = options();
  schema.r2options = { adminSearch };

  Plugin.plugins(schema, { patchHistory: { name: 'cmsNested' } });
  schema.plugin(material);
  schema.plugin(mongooseIntl, { languages: locales, defaultLanguage: defaultLocale });

  return mongoose.model('cmsNested', schema);
};
