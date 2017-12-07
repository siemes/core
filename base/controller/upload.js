const getMime = require('mime-types');
const filesize = require('filesize');
const _ = require('underscore');

module.exports = (app) => {
  const S3 = app.service('S3');
  const mCmsMedia = app.service('Mongoose').model('cmsMedia');
  const { created } = app.handler;
  const { partial: p } = _;

  const signRestRequest = (req, res) => {
    const v4 = req.query.v4;
    const strToSign = req.body.headers;
    const signature = v4 ? S3.signV4Rest(strToSign) : S3.signV2Rest(strToSign);
    res.json({ signature });
  };

  const signPolicy = (req, res) => {
    const v4 = req.query.v4;
    const policy = req.body;
    const base64Policy = new Buffer(JSON.stringify(policy)).toString('base64');
    const signature = v4 ? S3.signV4Policy(policy, base64Policy) : S3.signV2Policy(base64Policy);
    res.json({ policy: base64Policy, signature });
  };

  return {
    sign(req, res) {
      if (req.body.headers) {
        signRestRequest(req, res);
      } else {
        signPolicy(req, res);
      }
    },

    complete(req, res, next) {
      const { parentId, title, uuid, fullPath, size = 0 } = req.body;
      const obj = { title, uuid, fullPath, size, itemType: 'file' };
      if (parentId) {
        Object.assign(obj, { parentId });
      }

      Object.assign(obj, { mime: getMime.lookup(title) });
      Object.assign(obj, { humanSize: filesize(size) });

      const { errors } = app.service('Admin');
      mCmsMedia.create(obj)
        .then(data => created(data, res))
        .catch(p(errors, next));
    },
  };
};
