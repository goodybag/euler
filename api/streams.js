/*
  API - Stream
*/

var
  // Module Dependencies
  Api     = require('./api')
, utils   = require('../utils')
, Logger  = require('../logger')
, errors  = require('../errors')
, ObjectId  = require('mongodb').ObjectID
  // Module Variables
, streams = new Api('streams')
, consumers = new Api('consumers')
, businesses = new Api('businesses')
, logger  = new Logger('Api.Streams')
;

streams.global = function(options, callback){
  options = utils.extend({
    skip:   0
  , limit:  15
  , sort:   [['dates.lastModified', -1]]

  , fields: {
      'who.type':       1
    // , 'who.screenName': 1
    , 'by'      :       1
    , 'what'    :       1
    , 'when'    :       1
    , 'where'   :       1
    , 'events'  :       1
    , 'dates'   :       1
    , 'data'    :       1
    }
  }, options);

  logger.info("Querying Streams with", options);

  // Todo: Don't pass back database errors - map to custom error
  streams.find({}, options, callback)
};

streams.insertRandom = function(){
  var aliases = [
    'sharks'
  , 'freak2julian'
  , 'alauzon'
  , 'STEVED'
  , 'rachees613'
  , 'Luhawk23'
  , 'willmer'
  , 'betsg'
  , 'Nacho'
  , 'PeaceLoveScience'
  , 'twelve'
  , 'MeganShorts'
  ];

  var charities = [
    'Health Alliance for Austin Musicians'
  , 'Austin Humane Society'
  , 'Please Be Kind To Cyclists'
  , 'Meals on Wheels and More'
  , 'Austin Children\'s Shelter'
  , 'Austin Pets Alive'
  ];

  var randAlias = Math.floor(Math.random()*aliases.length);
  var randCharity = Math.floor(Math.random()*charities.length);

  consumers.find({screenName: aliases[randAlias]}, function(err, consumers){
    if (err) return logger.warn("couldn't find consumer with that username");

    var consumer = consumers[0];
    options = utils.extend(
      {
        skip:   0
      , limit:  1
      , sort:   [['dates.lastModified', -1]]
      }
    , {}
    );
    streams.find({}, options, function(err, events){
      if (err) return logger.warn("couldn't find a single stream - this sucks");

      var event = events[0];
      event._id = new ObjectId();

      event.when = new Date();
      event.dates.lastModified = new Date();
      event.dates.created = new Date();

      event.who.id = consumer._id;
      event.who.screenName = consumer.screenName;
      event.who.name = consumer.firstName + " " + consumer.lastName;

      event.data.charity.name = charities[randCharity];

      var skipRand = Math.floor(Math.random()*50);
      businesses.findOne(
        {isCharity: false}
      , {
          skip: skipRand
        }
      , function(err, business){
          if (err) return logger.warn("couldn't find business");
          event.where.org.id = business._id
          event.where.org.name = business.publicName

          streams.save(event, function(err, result){
            if(err) return logger.error("error saving stream");
          });
        }
      );
    });
  });
}

module.exports = streams;
