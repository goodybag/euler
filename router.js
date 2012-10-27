/*
  Router
*/

var
  // Module Dependencies
  routes    = require('./routes')
, utils     = require('./utils')

  // Module Variables
, router    = {}
;

router.init = function(app){
  app.get(/[a-z]/i, function(req, res){ utils.sendJSON({ hello: "hello" })});

  app.post('/consumers', routes.consumers.register);

  app.get('/streams/global', routes.streams.global);

  // Leave down here to ensure everything is working ok
  app.get('/test', function(req, res){
    utils.sendJSON(res, {
      "i": "read you loud and clear!"
    })
  });
};

module.exports = router;