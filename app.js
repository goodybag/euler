
/**
 * Module dependencies.
 */

var
  express = require('express')
, router  = require('./router')
, app     = module.exports = express.createServer()
, api     = require('./api')
;

// Configuration

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/app'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

router.init(app);

function insertRandomStreamEvent(frequency){
  setTimeout(
    function(){
      api.streams.insertRandom();
      insertRandomStreamEvent(5000 + Math.floor(Math.random()* 10) * 1000);
    }
    , frequency
  );
}

insertRandomStreamEvent(5000 + Math.floor(Math.random()* 10) * 1000);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
