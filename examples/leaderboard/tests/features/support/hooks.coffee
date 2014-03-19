module.exports = ->

  @Around (runScenario) ->

    @server.evalSync setUpExamples

    @users =
      'I': @client
      'Adam': @client
      'Brenda': @client2

    runScenario (callback) ->
      callback()


setUpExamples = ->
  exampleData = 
    "Ada Lovelace" : 40
    "Grace Hopper" : 40
    "Marie Curie" : 30
    "Carl Friedrich Gauss" : 20
    "Nikola Tesla" : 10
    "Claude Shannon" : 5
  for name of exampleData
    Players.update { name: name }, { $set: score: exampleData[name] }
  emit 'return'
