/**
 * API - Base API
 *
 * Thin wrapper on top of the native driver collection interface for added validation and
 * parameter convenience
 */

var
  config    = require('../config')
, db        = require('mongode').connect(config.mongoConnStr)
, ObjectId  = require('mongodb').ObjectID
, utils     = require('../utils')

, _defaults = {
    schema: null
  }
;

/**
 * Constructor for the Base API class
 * @param  {String}   collection  ObjectId
 * @return {instance of api}
 */
var Api = function(collection, options){
  this.collection = db.collection(collection);
  // Clone defaults
  var defaults = {};
  for (var key in _defaults){
    defaults[key] = _defaults[key];
  }
  this.options = defaults;
  for (var key in options){
    this.options[key] = options[key];
  }
  this.schema = this.options.schema;
};


Api.prototype = {
  // Placeholder function that is called when the api is put together
  initialize: utils.noop

  /**
   * Returns the first item in the find query
   *
   * Various argument possibilities
   *  - callback?
   *  - selector, callback?,
   *  - selector, fields, callback?
   *  - selector, options, callback?
   *
   * Options
   *  - **limit** {Number, default:0}, sets the limit of documents returned in the query.
   *  - **sort** {Array | Object}, set to sort the documents coming back from the query. Array of indexes, [['a', 1]] etc.
   *  - **fields** {Object}, the fields to return in the query. Object of fields to include or exclude (not both), {'a':1}
   *  - **skip** {Number, default:0}, set to skip N documents ahead in your query (useful for pagination).
   *  - **hint** {Object}, tell the query to use specific indexes in the query. Object of indexes to use, {'_id':1}
   *  - **explain** {Boolean, default:false}, explain the query instead of returning the data.
   *  - **snapshot** {Boolean, default:false}, snapshot query.
   *  - **timeout** {Boolean, default:false}, specify if the cursor can timeout.
   *  - **tailable** {Boolean, default:false}, specify if the cursor is tailable.
   *  - **awaitdata** {Boolean, default:false} allow the cursor to wait for data, only applicable for tailable cursor.
   *  - **batchSize** {Number, default:0}, set the batchSize for the getMoreCommand when iterating over the query results.
   *  - **returnKey** {Boolean, default:false}, only return the index key.
   *  - **maxScan** {Number}, Limit the number of items to scan.
   *  - **min** {Number}, Set index bounds.
   *  - **max** {Number}, Set index bounds.
   *  - **showDiskLoc** {Boolean, default:false}, Show disk location of results.
   *  - **comment** {String}, You can put a $comment field on a query to make looking in the profiler logs simpler.
   *  - **raw** {Boolean, default:false}, Return all BSON documents as Raw Buffer documents.
   *  - **readPreference** {String}, the preferred read preference ((Server.PRIMARY, Server.PRIMARY_PREFERRED, Server.SECONDARY, Server.SECONDARY_PREFERRED, Server.NEAREST).
   *  - **numberOfRetries** {Number, default:1}, if using awaidata specifies the number of times to retry on timeout.
   *
   * @param {Object} query query object to locate the object to modify
   * @param {Object} [options] additional options during update.
   * @param {Function} [callback] optional callback for cursor.
   * @return {Cursor} returns a cursor to the query
   * @api public
   */
, findOne: function(selector, options, callback){
    // selector is probably an id
    if (typeof selector === "string"){
      selector = new ObjectId(selector);
    }
    if (selector instanceof ObjectId){
      selector = { _id: selector };
    }
    return this.collection.findOne(selector, options, callback);
  }

  /**
   * Returns an array of the results from selector
   *
   * Various argument possibilities
   *  - callback?
   *  - selector, callback?,
   *  - selector, fields, callback?
   *  - selector, options, callback?
   *
   * Options
   *  - **limit** {Number, default:0}, sets the limit of documents returned in the query.
   *  - **sort** {Array | Object}, set to sort the documents coming back from the query. Array of indexes, [['a', 1]] etc.
   *  - **fields** {Object}, the fields to return in the query. Object of fields to include or exclude (not both), {'a':1}
   *  - **skip** {Number, default:0}, set to skip N documents ahead in your query (useful for pagination).
   *  - **hint** {Object}, tell the query to use specific indexes in the query. Object of indexes to use, {'_id':1}
   *  - **explain** {Boolean, default:false}, explain the query instead of returning the data.
   *  - **snapshot** {Boolean, default:false}, snapshot query.
   *  - **timeout** {Boolean, default:false}, specify if the cursor can timeout.
   *  - **tailable** {Boolean, default:false}, specify if the cursor is tailable.
   *  - **awaitdata** {Boolean, default:false} allow the cursor to wait for data, only applicable for tailable cursor.
   *  - **batchSize** {Number, default:0}, set the batchSize for the getMoreCommand when iterating over the query results.
   *  - **returnKey** {Boolean, default:false}, only return the index key.
   *  - **maxScan** {Number}, Limit the number of items to scan.
   *  - **min** {Number}, Set index bounds.
   *  - **max** {Number}, Set index bounds.
   *  - **showDiskLoc** {Boolean, default:false}, Show disk location of results.
   *  - **comment** {String}, You can put a $comment field on a query to make looking in the profiler logs simpler.
   *  - **raw** {Boolean, default:false}, Return all BSON documents as Raw Buffer documents.
   *  - **readPreference** {String}, the preferred read preference ((Server.PRIMARY, Server.PRIMARY_PREFERRED, Server.SECONDARY, Server.SECONDARY_PREFERRED, Server.NEAREST).
   *  - **numberOfRetries** {Number, default:1}, if using awaidata specifies the number of times to retry on timeout.
   *
   * @param {Object} query query object to locate the object to modify
   * @param {Object} [options] additional options during update.
   * @param {Function} [callback] optional callback for cursor.
   * @return {Cursor} returns a cursor to the query
   * @api public
   */
, find: function(selector, options, callback){
    if (typeof options === "function"){
      callback = options;
      options = {};
    }
    var query = this.collection.find(selector, options);
    return query.toArray(callback);
  }

  /**
   * Save a document. Simple full document replacement function. Not recommended for efficiency, use atomic
   * operators and update instead for more efficient operations. If you're only saving one document
   * Only one document will be sent to the callback
   *
   * Options
   *  - **safe** {true | {w:n, wtimeout:n} | {fsync:true}, default:false}, executes with a getLastError command returning the results of the command on MongoDB.
   *
   * @param {Object} [doc]        the document to save
   * @param {Object} [options]    additional options during remove.
   * @param {Function} [callback] returns the docs, must be provided if you are performing a safe save
   * @return {null}
   * @api public
   */
, save: function(doc, options, callback){
    if (typeof options === "function"){
      callback = options;
      options = {};
    }
    if (this.schema){
      var error = null;
      utils.validate(doc, this.schema, function(_error){
        error = _error;
      });
      if (error) return callback(error);
    }
    return this.collection.insert(doc, options, function(error, doc){
      callback(error, (doc && doc.length === 1) ? doc[0] : doc);
    });
  }

  /**
   * Updates documents.
   *
   * Options
   *  - **safe** {true | {w:n, wtimeout:n} | {fsync:true}, default:false}, executes with a getLastError command returning the results of the command on MongoDB.
   *  - **upsert** {Boolean, default:false}, perform an upsert operation.
   *  - **multi** {Boolean, default:false}, update all documents matching the selector.
   *  - **serializeFunctions** {Boolean, default:false}, serialize functions on the document.
   *
   * @param {Object} selector the query to select the document/documents to be updated
   * @param {Object} document the fields/vals to be updated, or in the case of an upsert operation, inserted.
   * @param {Object} [options] additional options during update.
   * @param {Function} [callback] must be provided if you performing a safe update
   * @return {null}
   * @api public
   */
, update: function(selector, document, options, callback){
    // Expand the update document and validate
    if (this.schema && (document.$set || document.$push)){
      var error = null, validationCb = function(_error){
        error = _error;
      };
      if (document.$set){
        utils.validate(utils.expandDocument(document.$set), this.schema, validationCb);
        if (error) return callback(error);
      }
      if (document.$push){
        utils.validate(utils.expandDocument(document.$push), this.schema, validationCb);
        if (error) return callback(error);
      }
    }
    if (typeof selector === "string") selector = new ObjectId(selector);
    if (selector instanceof ObjectId) selector = { _id: selector };
    return this.collection.update(selector, document, options, callback);
  }

  /**
   * Find and update a document.
   *
   * Options
   *  - **safe** {true | {w:n, wtimeout:n} | {fsync:true}, default:false}, executes with a getLastError command returning the results of the command on MongoDB.
   *  - **remove** {Boolean, default:false}, set to true to remove the object before returning.
   *  - **upsert** {Boolean, default:false}, perform an upsert operation.
   *  - **new** {Boolean, default:false}, set to true if you want to return the modified object rather than the original. Ignored for remove.
   *
   * @param {Object}    [selector]  - query object to locate the object to modify
   * @param {Array}     [sort]      - if multiple docs match, choose the first one in the specified sort order as the object to manipulate
   * @param {Object}    [doc]       - the fields/vals to be updated
   * @param {Object}    [options]   - additional options during update.
   * @param {Function}  [callback]  - returns results.
   * @return {null}
   * @api public
   */
, findAndModify: function(selector, sort, document, options, callback){
    // Expand the update document and validate
    if (this.schema && (document.$set || document.$push)){
      var error = null, validationCb = function(_error){
        error = _error;
      };
      if (document.$set){
        utils.validate(utils.expandDocument(document.$set), this.schema, validationCb);
        if (error) return callback(error);
      }
      if (document.$push){
        utils.validate(utils.expandDocument(document.$push), this.schema, validationCb);
        if (error) return callback(error);
      }
    }
    if (typeof selector === "string") selector = new ObjectId(selector);
    if (selector instanceof ObjectId) selector = { _id: selector };
    return this.collection.findAndModify(selector, sort, document, options, callback);
  }

  /**
   * Find and remove a document
   *
   * Options
   *  - **safe** {true | {w:n, wtimeout:n} | {fsync:true}, default:false}, executes with a getLastError command returning the results of the command on MongoDB.
   *
   * @param {Object}    [selector]  - query object to locate the object to modify
   * @param {Array}     [sort]      - if multiple docs match, choose the first one in the specified sort order as the object to manipulate
   * @param {Object}    [options]   - additional options during update.
   * @param {Function}  [callback]  - returns results.
   * @return {null}
   * @api public
   */
, findAndRemove: function(selector, sort, document, options, callback){
    if (typeof selector === "string") selector = new ObjectId(selector);
    if (selector instanceof ObjectId) selector = { _id: selector };
    return this.collection.findAndRemove(selector, sort, document, options, callback);
  }

  /**
   * Removes documents specified by `selector` from the db.
   *
   * Options
   *  - **safe** {true | {w:n, wtimeout:n} | {fsync:true}, default:false}, executes with a getLastError command returning the results of the command on MongoDB.
   *  - **single** {Boolean, default:false}, removes the first document found.
   *
   * @param {Object}    [selector]  - optional select, no selector is equivalent to removing all documents.
   * @param {Object}    [options]   - additional options during remove.
   * @param {Function}  [callback]  - must be provided if you performing a safe remove
   * @return {null}
   * @api public
   */
, remove: function(selector, options, callback){
    if (typeof selector == "string"){
      selector = new ObjectId(selector);
    }
    if (selector instanceof ObjectId){
      selector = { _id: selector };
    }
    return this.collection.remove(selector, options, callback);
  }

  /**
   * Count number of matching documents in the db to a query.
   *
   * Options
   *  - **readPreference** {String}, the preferred read preference (Server.PRIMARY, Server.PRIMARY_PREFERRED, Server.SECONDARY, Server.SECONDARY_PREFERRED, Server.NEAREST).
   *
   * @param {Object}    [selector]  - query to filter by before performing count.
   * @param {Object}    [options]   - additional options during update.
   * @param {Function}  [callback]  - must be provided.
   * @return {null}
   * @api public
   */
, count: function(selector, options, callback){
    return this.collection.count(selector, options, callback);
  }

  /**
   * Creates an index on the collection.
   *
   * Options
   *  - **safe** {true | {w:n, wtimeout:n} | {fsync:true}, default:false}, executes with a
   *  - **unique** {Boolean, default:false}, creates an unique index.
   *  - **sparse** {Boolean, default:false}, creates a sparse index.
   *  - **background** {Boolean, default:false}, creates the index in the background, yielding whenever possible.
   *  - **dropDups** {Boolean, default:false}, a unique index cannot be created on a key that has pre-existing duplicate values. If you would like to create the index anyway, keeping the first document the database indexes and deleting all subsequent documents that have duplicate value
   *  - **min** {Number}, for geospatial indexes set the lower bound for the co-ordinates.
   *  - **max** {Number}, for geospatial indexes set the high bound for the co-ordinates.
   *
   * @param {Object}    [fieldOrSpec] - fieldOrSpec that defines the index.
   * @param {Object}    [options]     - additional options during update.
   * @param {Function}  [callback]    - for results.
   * @return {null}
   * @api public
   */
, createIndex: function(fieldOrSpec, options, callback){
    return this.collection.createIndex(fieldOrSpec, options, callback);
  }
};

module.exports = Api;