# TODO Explicit stating of the test data to use
# https://stackoverflow.com/questions/4671703/should-bdd-scenarios-include-actual-test-data-or-just-describe-it
@Capability @HMWS-VISION_UM_4.3
Feature: Capability
    As an Admin
    I should be able to Create, Read, Update, and Delete a Capability.

    Background: User is logged in as an Admin
        Given The user is logged in as an Admin

    @Create @HMWS-VISION_UM_4.3.1
    Scenario: Create a Capability
        Given The user is on the Capabilities page
        When The user creates a Capability
        Then The user should be redirected to the details page of the created Capability
            And The user should see the created details of the Capability
        
    @Read
    Scenario: Read Capability details from the list
        Given An ACTIVE Capability exists
        When The user navigates to the Capabilities page
        Then The user should see the details of the Capabilities in the table

    @Read
    Scenario: Read Capability details from its page
        Given An ACTIVE Capability exists
        When The user navigates to the ACTIVE Capabilities page
        Then The user should see the details of the ACTIVE Capability

    @Edit @HMWS-VISION_UM_4.3.2
    Scenario: Edit a Capability from the list
        Given An ACTIVE Capability exists
            And The user is on the Capabilities page
        When The user edits a Capability
        Then The user should see the details of the edited Capabilities in the table

    @Edit @HMWS-VISION_UM_4.3.2
    Scenario: Edit a Capability from its page
        Given An ACTIVE Capability exists
            And The user navigates to the ACTIVE Capabilities page
        When The user edits the Capability
        Then The user should see the edited details of the Capability

    @Delete @HMWS-VISION_UM_4.3.4
    Scenario: Delete a Capability from its page
        Given An ACTIVE Capability exists
            And The user navigates to the ACTIVE Capabilities page
        When The user deletes the Capability
        Then The user should be not be able to execute further actions on the Capability

    @Delete @HMWS-VISION_UM_4.3.4
    Scenario: Delete a Capability
        Given An ACTIVE Capability exists
            And The user is on the Capabilities page
        When The user deletes a Capability
        Then The user should not see the details of the deleted Capabilities in the table