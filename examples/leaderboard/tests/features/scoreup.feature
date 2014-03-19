Feature: Adding points

  Scenario: Add points to first
    Given I select item 'Marie Curie'
    And I push vote button
    Then I see the item 'Marie Curie' has 35 points

  Scenario: Position up
    Given I select item 'Grace Hopper'
    And I push vote button
    Then I see the first item is 'Grace Hopper'

  @laika2Clients
  Scenario: Two users voting
    Given Adam select item 'Grace Hopper'
    And Brenda select item 'Nikola Tesla'
    And Adam push vote button
    And Brenda push vote button
    And Brenda push vote button again
    Then Adam see the item 'Nokola Tesla' has 15 points
    And Brenda see the last item is 'Ada Lovelace'