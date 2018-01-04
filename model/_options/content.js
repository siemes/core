const { Schema } = require('querymen');

module.exports = () => (
  {
    adminSearch() {
      const q = new Schema();
      q.param('qType', null, { enum: ['all', 'allTotal', 'one', 'total', 'arrayTree', 'fullArrayTree'] });
      q.param('limit', 10, { type: Number, max: 100 });
      q.param('sort', '-_id');

      q.param('_id', null);
      q.param('parent', null).option('parentParser', 'prop');
      q.parser('parentParser', (prop, value) => {
        if (value === 'null') {
          value = null;
        }

        return { parentId: value };
      });

      q.param('ids', null, { multiple: true }).option('idsParser', 'prop');
      q.parser('idsParser', (prop, value) => (
        { _id: { $in: value } }
      ));

      q.param('term', null).option('searchParser', 'prop');
      q.parser('searchParser', (prop, value) => (
        { title: new RegExp(value, 'i') }
      ));

      q.param('childSort', null).option('childSortParser', 'prop');
      q.parser('childSortParser', (prop, value) => (
        { childOpts: { sort: { _w: (value === 'asc' ? 1 : -1) } } }
      ));

      q.param('kind', null, { multiple: true }).option('kindParser', 'prop');
      q.parser('kindParser', (prop, value) => (
        { kind: { $in: (typeof value === 'string') ? [value] : value } }
      ));

      return q;
    },

    rules: {
      title: 'required',
    },
  }
);
