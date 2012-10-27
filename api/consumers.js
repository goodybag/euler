/*
  API - Consumers
*/

var
  // Module Dependencies
  Api     = require('./api')
, utils   = require('../utils')
, Logger  = require('../logger')
, errors  = require('../errors')

  // Module Variables
, consumers = new Api('consumers')
, logger    = Logger('Api.Consumers')
;

/**
 * Register a user with goodybag
 * @param  {Object}   consumer The users information
 * @param  {Function} callback A callback with the results
 */
consumers.register = function(consumer, callback){
  var callbacks = {
    // First query to see if the email or screenName already exists
    start: function(){
      var
        selector = {
          $or: [
            { email: consumer.email }
          , { screenName: consumer.screenName }
          ]
        }
      , options = {
          fields: {
            email: 1
          , screenName: 1
          }
        }
      ;
      consumers.findOne(selector, options, callbacks.checkExisting);
    }
    // If it does exist, return an error, else we need to encrypt the given password
    // We could probably do the check and the encryption in parallel
    // But we'll just keep it serial for now
  , checkExisting: function(error, _consumer){
      if (error) return logger.error(error), callback(error);
      if (_consumer){
        if (_consumer.email === consumer.email)
          return logger.info(errors.emailTaken), callback(errors.emailTaken);
        if (_consumer.screenName === consumer.screenName)
          return logger.info(errors.screenNameTaken), callback(errors.screenNameTaken);
      }

      utils.encryptPassword(consumer.password, callbacks.encrypt);
    }
    // Once the encryption is complete, save the consumer with the encrypted password
    // To the database
  , encrypt: function(error, hash){
      if (error) return logger.error(error), callback(error);
      consumer.password = hash;
      consumers.save(consumer, callbacks.save);
    }
    // Once the save is complete, callback
  , save: function(error, _consumer){
      if (error) return logger.error(error), callback(error);
      logger.info("User registered!", _consumer);
      callback(null, consumer);
    }
  };
  callbacks.start();
};

module.exports = consumers;