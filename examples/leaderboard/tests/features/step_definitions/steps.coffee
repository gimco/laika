{expect} = require 'chai'

module.exports = ->
  @Given /^(.*) select item '(.*)'$/, (user, item, callback) ->

    @users[user].evalSync ->
      Meteor.setInterval ->
        console.log $("body").html()
      , 1000

    @users[user].evalSync (item) ->
      $(".player span:contains('#{item}')").parent().click()
      emit 'return'
    , item

    selected_player = @users[user].evalSync -> emit 'return', Session.get 'selected_player'

    console.log selected_player
    callback.pending()

  @Given /^(.*) push vote button( again)?$/, (user, optional, callback) ->
    aa = @users[user].evalSync ->
      $("input.inc").click()
      emit 'return', Session.get("selected_player")
    console.log aa
    callback()

  @Then /^(.*) see the item '(.*)' has (\d+) points$/, (user, item, points, callback) ->
    score = @users[user].evalSync ((item) ->
      score = $(".player span:contains('#{item}')").parent().find('.score').text()
      emit 'return', score
    ), item
    expect(score).to.be.equal points
    callback()

  @Then /^(.*) see the first item is '(.*)'$/, (user, item, callback) ->
    # express the regexp above with the code you wish you had
    callback.pending()

  @Then /^(.*) see the last item is '(.*)'$/, (user, item, callback) ->
    # express the regexp above with the code you wish you had
    callback.pending()