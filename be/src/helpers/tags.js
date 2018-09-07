import Tag from './../models/tags';

export const allTags = (data, callback) => {
  Tag.all((err, rows) => {
    if (err) return callback(err);

    callback(err, {responsePayload: rows});
  });
};

export const createTag = (data, callback) => {
  const { name } = data;
  Tag.create(name, null, (err, rows) => {
    if (err) return callback(err);

    callback(err, {responsePayload: rows});
  });
};

export const applyTags = (data, callback) => {
  const { memberIds, tagIds } = data;
  Tag.apply(memberIds, tagIds, (err, rows) => {
    if (err) return callback(err);

    callback(err, {responsePayload: rows});
  });
};

