const { Schema } = require('querymen');

module.exports = () => (
  {
    adminSearch() {
      const q = new Schema();
      q.param('qType', null, { enum: ['all', 'allTotal', 'one', 'total'] });
      q.param('limit', 10, { type: Number, max: 100 });
      q.param('sort', '-_id');
      return q;
    },

    rules: {
      key: 'required',
      value: 'required',
    },
  }
);
