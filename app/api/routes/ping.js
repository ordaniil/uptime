/**
 * Module dependencies.
 */

var Check      = require('../../../models/check');
var CheckEvent = require('../../../models/checkEvent');
var Ping       = require('../../../models/ping');

/**
 * Check Routes
 */
module.exports = function(app) {
  
  app.get('/pings/check/:id/:page?', function(req, res) {
    Check.count({ _id: req.params.id}, function(err, nb_checks) {
      if (err) return app.next(err);
      if (!nb_checks) return app.next(new Error('failed to load check ' + req.params.id));
      Ping.find({ check: req.params.id }).desc('timestamp').limit(50).skip((req.params.page -1) * 50).run(function(err, pings) {
        if (err) return next(err);
        res.json(pings);
      });
    });
  });

  app.get('/pings/events', function(req, res) {
    CheckEvent.find({ timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)} }).desc('timestamp').populate('check').run(function(err, events) {
      if (err) return next(err);
      res.json(CheckEvent.aggregateEventsByDay(events));
    });
  });

  app.put('/ping', function(req, res) {
    Check.findById(req.body.checkId, function(err1, check) {
      if (err1) {
        res.send(err1.message, 500);
        return;
      };
      Ping.createForCheck(check, req.body.status, req.body.time, req.body.error, function(err2, ping) {
        if (err2) {
          res.send(err2.message, 500);
          return;
        }
        res.json(ping);
      });
    })
  });

};