# TODO Explicit stating of the test data to use
# https://stackoverflow.com/questions/4671703/should-bdd-scenarios-include-actual-test-data-or-just-describe-it
@Capability
Feature: Capability
    As an Admin
    I should be able to Create, Read, Update, and Delete a Capability.

    Background: User is logged in as an Admin
        Given The user is logged in as an Admin

    @Create
    Scenario: Create a Capability
        Given The user is on the Capabilities page
        When The user creates a Capability
        Then The user should be redirected to the details page of the created Capability
            And The user should see the created details of the Capability
        
    @Read
    Scenario: Read Capability details from the table
        Given An ACTIVE Capability exists
        When The user navigates to the Capabilities page
        Then The user should see the details of the Capabilities in the table

    @Read
    Scenario: Read Capability details from its page
        Given An ACTIVE Capability exists
        When The user navigates to the ACTIVE Capabilities page
        Then The user should see the details of the ACTIVE Capability

    # @Edit
    # Scenario: Edit a Capability from the table
    #     Given An ACTIVE Capability exists
    #         And The user is on the Capabilities page
    #     When The user edits a Capability
        # Then The user should "see" the details of the "Capabilities" in the table
#             And I should see the "updated" item details of the "Capability" 
        
#     @DeleteCapability
#     Scenario: Delete a Capability
#         Given I have an existing "Capability"
#             And I am on "/#/hmws/capabilities"
#         When I "delete" a "Capability"
#         Then I should "not see" the details of the "Capability" in the table