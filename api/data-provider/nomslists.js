const MongoInstance = require('./mongodb');
const Assert = require('assert');

const nomsListCollectionName = 'noms-lists';

module.exports.getLists = function(callback) {

  MongoInstance.checkDatabaseandServer();

  const nomsListsCollection = MongoInstance.database.collection(nomsListCollectionName);

  nomsListsCollection.find({}).toArray(function(err, docs) {

    Assert.equal(err, null);
    MongoInstance.server.log('Found the following records', docs);

    callback({
      status: 'success',
      result: docs
    });

  });
}

module.exports.getList = function(id, callback) {

  MongoInstance.checkDatabaseandServer();

  const nomsListsCollection = MongoInstance.database.collection(nomsListCollectionName)
  nomsListsCollection.find({
    '_id': new MongoInstance.mongo.ObjectID(id)
  }).toArray(function(err, doc) {

    Assert.equal(err, null);

    callback({
      status: 'success',
      result: doc
    });
  });
}

module.exports.addList = function(listData, callback) {

  MongoInstance.checkDatabaseandServer();

  const nomsListsCollection = MongoInstance.database.collection(nomsListCollectionName);

  nomsListsCollection.insertOne({
    ownerId: new MongoInstance.mongo.ObjectID(listData.ownerId),
    name: listData.name,
    restaurants: []
  }, function(err, result) {

    Assert.equal(err, null);

    callback({
      status: 'success',
      result: [{
        id: result.insertedId
      }]
    });
  });
}

module.exports.updateList = function(listData, callback) {

  MongoInstance.checkDatabaseandServer();

  const nomsListsCollection = MongoInstance.database.collection(nomsListCollectionName);

  const modifications = {};

  const remove = function() {
    nomsListsCollection.updateOne(
      {
        '_id': new MongoInstance.mongo.ObjectID(listData.listId)
      },
      { '$pullAll' : { 'restaurants': listData.remove } },
      function(err, r) {

        Assert.equal(err, null);

        callback({
          status: 'success',
          result: [r]
        });
      }
    );
  }

  if (listData.name != null && listData.name != '') {
    modifications['$set'] = { 'name': listData.name };
  }

  if (listData.add != null && listData.add.length > 0) {
    modifications['$addToSet'] = {
      'restaurants' : {
        $each: listData.add
      }
    }

    nomsListsCollection.updateOne(
      {
        '_id': new MongoInstance.mongo.ObjectID(listData.listId)
      },
      modifications,
      function(err, r) {

        Assert.equal(err, null);

        if (listData.remove != null && listData.remove.length > 0) {
          return remove();
        } else {
          return callback({
            status: 'success',
            result: [r]
          });
        }
      }
    );
  } else if (listData.remove != null && listData.remove.length > 0) {
    return remove();
  } else {
    nomsListsCollection.updateOne(
      {
        '_id': new MongoInstance.mongo.ObjectID(listData.listId)
      },
      modifications,
      function(err, r) {
        Assert.equal(err, null);

        return callback({
          status: 'success',
          result: [r]
        });
      }
    );
  }
}

module.exports.deleteList = function(id, callback) {

  MongoInstance.checkDatabaseandServer();

  const nomsListsCollection = MongoInstance.database.collection(nomsListCollectionName)

  nomsListsCollection.deleteOne({
    '_id': new MongoInstance.mongo.ObjectID(id)
  }, function(err, r) {

    Assert.equal(err, null);

    callback({
      status: 'success',
      result: [r]
    })
  })
}
