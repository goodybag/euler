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
, streams = {}
, logger    = new Logger('Routes.Streams')
;

/**
 * Global stream
 */
streams.global = function(req, res){
  var
    // Create a domain to catch in exceptions
    reqd    = domain.create()
    // Get options from query params
  , options = {
      skip:   req.query.skip  || 0
    , limit:  req.query.limit || 15
    }
  , callbacks = {
      start: function(){
        logger.info("Calling api.streams.global with: ", options);
        api.streams.global(options, callbacks.results)
      }
    , results: function(error, results){
        if (error) return logger.error(error), utils.sendError(res, error);
        logger.info("Got {num} results back", { num: results.length });
        utils.sendJSON(res, null, results);
      }
    }
  ;
  reqd.run(callbacks.start);
  reqd.on('error', function(error){
    logger.error(error);
  });
};

module.exports = streams;