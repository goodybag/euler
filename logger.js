/**
 * Logger - Currently just outputs to terminal
 *
 * example:
 *
 * var Logger = require('./Logger');
 * var logger = new Logger('Api.Consumer');
 * logger.warn("User {id} cannot be found", { id: user.id });
 *
 * TODO:
 *   Implement with external logger
 *   Write to file
 */

var
  utils   = require('./utils')
, color   = require('colors')

, isInter = /{([^{}]*)}/

, interpolate = function(){
    var args = arguments;
    // Check if we should interpolate string
    if (typeof args["0"] === "string" && typeof args["1"] === "object" && isInter.test(args["0"])){
      args = [utils.interpolate(args["0"], args["1"])];
      if (arguments.length > 2) args = args.concat(Array.prototype.slice.call(arguments, 2));
    }
    return args;
  }

, logger = {}

, Logger = function(section){
    this.section = section;
  }
;

Logger.prototype = {
  log: function(type, color, args){
    // ensure array
    args = Array.prototype.slice.call(interpolate.apply({}, args), 0);
    args.unshift(
      utils.interpolate(
        "\n[{type}] - [{section}] - {date}\n"
      , {
          type: type
        , date: new Date().toString()
        , section: this.section
        }
      )[color]
    );
    console.log.apply(console, args);
  }
, info: function(){
    this.log.call(this, 'Info', 'red', arguments);
  }
, debug: function(){
    this.log.call(this, 'Debug', 'magenta', arguments);
  }
, warn: function(){
    this.log.call(this, 'Warn', 'yellow', arguments);
  }
, error: function(){
    this.log.call(this, 'Error', 'red', arguments);
  }
};

module.exports = Logger;