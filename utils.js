/*
  Utils
*/

var
  // Third Party Dependencies
  bcrypt    = require('bcrypt')
// , amanda    = require('amanda')
, _         = require('underscore')

  // Module Dependencies
, globals   = require('./globals')
, config    = require('./config')

  // Module Variables
, defaults  = globals.defaults
// , validator = amanda('json')

  // Make underscores functionality available on utils
, utils     = _.extend({}, _)
;

/**
 * Ol' boy crockfords String interpolation
 * @param  {String} str    The string you want to interpolate with
 * @param  {Object} values The object mapping the keys in the string to values
 * @return {String}        The result
 * @example
 *   "Hello, my name is {name}", { name: "Stacy" } => "Hello, my name is Stacy."
 */
utils.interpolate = function(str, values){
  return str.replace(/{([^{}]*)}/g, function(a, b){
    var r = values[b];
    return typeof r === 'string' || typeof r === 'number' ? r : a;
  });
};

/**
 * Validates a document with a given schema
 * @param  {Object}   data     The document to validated
 * @param  {Object}   schema   The schema to validate against
 * @param  {Object}   options  Optional options for amanda - Uses default gb options
 * @param  {Function} callback Passed the errors object if there were verrors
 * @return {Null}
 */
// utils.validate = function(data, schema, options, callback){
//   if (typeof options === "function"){
//     callback = options;
//     options = config.validationOptions;
//   }
//   validator.validate(data, schema, options, function(errors){
//     if (errors) errors.type = "validation";
//     callback(errors);
//   });
// };

/**
 * Expands a flattened query object
 * @param  {Object} doc The flattened document to be expanded
 * @return {Object}     The flattened document
 */
utils.expandDoc = function(doc){
  var expanded = {}, parts, deepObj, curr, currKey;
  for (var key in doc){
    if (key.indexOf(".")){
      parts   = key.split('.');
      deepObj = doc[key];
      while (parts.length > 1){
        currKey       = parts.pop();
        curr          = {};
        curr[currKey] = deepObj;
        deepObj       = curr;
      }
      expanded[parts[0]] = deepObj;
    }else expanded[key]  = doc[key];
  }
  return expanded;
};

/**
 * Flattens a query object to be used with mongo queries { "some.thing.else": "blah" }
 * @param  {Object}  doc        The nested query object to be flattened
 * @param  {String}  startPath  Top level key
 * @return {Object}             The flattened document
 */
utils.flattenDoc = function(doc, startPath){
  var flat = {},
  flatten = function(obj, path){
    if (typeof obj === "object"){
      (path && (path += ".")) || (path = "");
      for (var key in obj) flatten(obj[key], path + key);
    }else if (Object.isArray(obj)){
      (path && (path += ".")) || (path = "");
      i = 0;
      while (i < obj.length){
        flatten(obj[i], path + i);
        i++;
      }
    }else{
      flat[path] = obj;
    }
    return flat;
  };
  return flatten(doc, startPath);
}

/**
 * Encrypts consumer passwords
 * @param  {String}   password  The password to encrypt
 * @param  {Function} callback  returns the error/data.
 * @return {null}
 */
utils.encryptPassword = function(password, callback){
  bcrypt.genSalt(defaults.passwordSaltLength, function(error, salt){
    if (error) return callback(error);
    bcrypt.hash(password + defaults.passwordSalt, salt, function(error, hash){
      if (error) return callback(error);
      callback(null, hash);
    });
  });
};

/**
 * Copmares a non-encrypted password with an encrypted one
 * @param  {String}   password  The non-encrypted string
 * @param  {String}   encrypted The encrypted string
 * @param  {Function} callback  Contains the results (error, success)
 * @return {Null}
 */
utils.comparePasswords = function(password, encrypted, callback){
  bcrypt.compare(password + defaults.passwordSalt, encrypted, callback);
};

/**
 * [interceptFunctions
 * Given a collection of functions, returns a collection of intercepted functions
 * specified by the given domain
 * You can pass in an object, an array, or just all the functions as parameters]
 * @param  {domain}     dom   [the domain to intercept]
 * @param  {collection} rest  [the collection to be intercepted]
 * @return {collection}       [the intercepted function collection]
 */
utils.interceptFunctions = function(dom, rest){
  var functions;
  if (typeof rest === "object"){
    functions = {};
    for (var key in rest){
      functions[key] = dom.intercept(rest[key]);
    }
  }else {
    functions = (Object.prototype.toString.call(rest)[8] == "A")
                ? rest : Array.prototype.slice.call(rest, 1);
    for (var i = 0; i < functions.length; i++){
      functions[i] = dom.intercept(functions[i]);
    }
  }
  return functions;
};

utils.sendJSON = function(res, error, data){
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  res.header('Access-Control-Allow-Origin', res.req.headers['origin']);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization');
  res.json({ error: error, data: data });
};

utils.sendError = function(res, error){
  utils.sendJSON(res, error);
};

utils.noop = function(){};

/**
 * Contains the default structure for errors - should probably use new Error(...)
 * @param  {String} message Nice message to be displayed
 * @param  {String} type    The type of error
 * @return {Object}         The error object
 */
utils.error = function(message, type){
  return {
    message: message
  , type: type
  };
};

module.exports = utils;