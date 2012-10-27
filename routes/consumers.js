/*
  Routes - Consumer
*/

var
  // App Dependencies
  api       = require('../api')
, utils     = require('../utils')
, Logger    = require('../logger')
, errors    = require('../errors')

, domain    = require('domain')


  // Module Variables
, consumers = {}
, logger    = new Logger('Routes.Consumers')
;

/**
 * Registration route
 */
consumers.register = function(req, res){
  var
    // Create a domain to catch in exceptions
    reqd = domain.create()
    // Get the consumer data - WARNING: no validation for this project
  , consumer = {
      firstName:  req.body.firstName
    , lastName:   req.body.lastName
    , screenName: req.body.screenName
    , email:      req.body.email
    , password:   req.body.password
    }
  , callbacks = {
      start: function(){
        api.consumers.register(consumer, callbacks.results)
      }
    , results: function(error, _consumer){
        if (error) return logger.error(error), utils.sendError(res, error);
        delete _consumer.password;
        utils.sendJSON(res, null, _consumer);
      }
    }
  ;
  reqd.run(callbacks.start);
  reqd.on('error', function(error){
    logger.error(error);
  });
};

module.exports = consumers;