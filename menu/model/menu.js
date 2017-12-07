const options = require('./_options/menu');

module.exports = (app) => {
  const { menu } = app.service('config/locales/model');
  const mongoose = app.service('Mongoose');
  const { Validate } = app.service('System');
  const { Schema } = mongoose;
  const { ObjectId } = mongoose.Schema.Types;

  const schema = Schema({
    page: { type: ObjectId, ref: 'cmsPage' },
    category: { type: ObjectId, ref: 'cmsCategory' },
    externalUrl: { type: String },
    display: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
  }, {
    timestamps: true,
  });

  schema.set('toJSON', { virtuals: true, getters: true });
  schema.set('toObject', { virtuals: true, getters: true });

  /*
  schema.virtual('pages', {
    ref: 'cmsPage',
    localField: '_id',
    foreignField: 'menus',
  });
  */

  function autoPopulatePage(next) {
    this.populate('page');
    next();
  }

  schema
    .pre('findOne', autoPopulatePage)
    .pre('find', autoPopulatePage);

  schema.statics.getMenuTree = function (query = {}, opts = {}) {
    const { lang, childOpts = {} } = opts;
    return new Promise((resolve, reject) => {
      this.findOne(query)
        .then((parent) => {
          if (!parent) {
            return resolve();
          }

          return parent.getChildren(childOpts, (err, children) => {
            const getChildren = children.map((child) => {
              child.setLanguage(lang);
              if (child.page && child.page._id) {
                child.page.setLanguage(lang);
              }
              return child;
            });

            resolve(this.ToArrayTree(getChildren));
          });
        })
        .catch(reject);
    });
  };

  const { adminSearch, rules } = options();
  schema.r2options = { adminSearch, attributes: menu, rules };
  Validate(schema, { attributes: menu, rules });

  const Nested = app.service('Mongoose').model('cmsNested');
  return Nested.discriminator('cmsMenu', schema);
};
