import Tag from './../models/tags';

export const allTags = (data, callback) => {
  Tag.all((err, rows) => {
    callback(err, {responsePayload: rows});
  });
};

export const createTagGroups = (data, callback) => {
  const { groups } = data;
  const tagNames = Object.keys(groups);

  for(let idx=0; idx<tagNames.length; idx+=1) {
    const tagName = tagNames[idx];
    const memberIds = groups[tagName]
    createTag({name: tagName, memberIds}, (err) => {
      if (err) return callback(err);
    })
  }

  callback(null, {responsePayload: data});
};

export const fetchMembers = (data, callback) => {
  const { pattern } = data;
  console.log(">>>fetchMembers");
  Tag.groupedByMembers(pattern, (err, rows) => {
    callback(err, {responsePayload: rows});
  });
};

export const deleteTag = (data, callback) => {
  const { name } = data;
  Tag.remove(name, (err, rows) => {
    callback(err, {responsePayload: rows});
  });
};

export const removeMembers = (data, callback) => {
  const { name, memberIds } = data;
  Tag.removeMembers(name, memberIds, (err, rows) => {
    callback(err, {responsePayload: {...data, ...rows}});
  });
};

export const createTag = (data, callback) => {
  const { name } = data;
  if (data.memberIds) {
    const { memberIds } = data;
    Tag.createWithMembers(name, null, memberIds, (err, rows) => {
      callback(err, {responsePayload: rows});
    });
  } else {
    Tag.create(name, null, (err, rows) => {
      callback(err, {responsePayload: rows});
    });
  }
};

export const applyTags = (data, callback) => {
  const { memberIds, tagIds } = data;
  Tag.apply(memberIds, tagIds, (err, rows) => {
    callback(err, {responsePayload: rows});
  });
};

export const loadTagMemberIds = (data, callback) => {
  const { tagId } = data;
  Tag.loadMemberIds(tagId, (err, rows) => {
    callback(err, {responsePayload: {...data, memberIds: rows}});
  });
};

