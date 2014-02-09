var ServerConnector = require('./connectors/server.js');
var ClientConnector = require('./connectors/client.js');
var logger = require('./logger');

module.exports = function(appPool, phantom, done) {
  return function cucumberRunner() {
    var Cucumber = require('cucumber');

    var _world;
    var configuration = Cucumber.Cli.Configuration(['', '', 'tests']);
    var supportCodeLibrary = configuration.getSupportCodeLibrary();

    var _instantiateNewWorld = supportCodeLibrary.instantiateNewWorld;
    supportCodeLibrary.instantiateNewWorld = function (callback) {
      return _instantiateNewWorld.call(supportCodeLibrary, function (world) {
        _world = world;
        callback(world);
      });
    };
    
    var meteorListener = Cucumber.Listener();
    meteorListener.handleBeforeScenarioEvent = function (event, callback) {
      var scenario = event.getPayloadItem('scenario');
      var tags = scenario.getTags().map(function(elem) {
        return elem.getName();
      });

      var noClients;
      if (tags.indexOf('@laika3clients') != -1) {
        noClients = 3;
      } else if (tags.indexOf('@laika2clients') != -1) {
        noClients = 2;
      } else {
        noClients = 1;
      }

      //create new server with different db and port
      app = appPool.get();
      var appPort = app.port
      var mongoDbname = app.dbname;
      var hostnames = ["localhost", "127.0.0.1", "0.0.0.0"];
      var clientNames = ['client', 'client2', 'client3']

      app.ready(function(injectPort) {
        _world.server = new ServerConnector(injectPort);
        
        var hostnameIssueWarned = false;
        for(var lc = 0; lc<noClients; lc++) {
          if(lc >= hostnames.length && !hostnameIssueWarned) {
            logger.error('  WARN: It is recommended to use 3 clients only. see more - http://goo.gl/MMX3A');
            hostnameIssueWarned = true;
          }
          var hostname = hostnames[lc] || "localhost";
          var appUrl = "http://" + hostname + ":" + appPort;
          _world[clientNames[lc]] = new ClientConnector(phantom, appUrl);
        }

        callback();
      });
    };

    meteorListener.handleAfterScenarioEvent = function (event, callback) {
      _world.server.close();
      _world.client.close();
      app.close(function () {
        callback();
      });
    };

    var listeners = Cucumber.Type.Collection();
    listeners.add(Cucumber.Listener.PrettyFormatter({coffeeScriptSnippets: true}));
    listeners.add(meteorListener);
    var featureSources = configuration.getFeatureSources();
    var astFilter      = configuration.getAstFilter();
    var parser         = Cucumber.Parser(featureSources, astFilter);
    var features       = parser.parse();
    var astTreeWalker      = Cucumber.Runtime.AstTreeWalker(features, supportCodeLibrary, listeners);
    astTreeWalker.walk(function (ok) {
      done(ok);
    });
  };
};
