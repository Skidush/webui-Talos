@Capability
Feature: Capability
    As a Manager
    I should be able to Create, Read, Update, and Delete a Capability.

    @Create
    Scenario: Create a Capability
        Given The user is on the Capabilities page
        When The user creates a Capability
        Then The user should be redirected to the details page of the created Capability
            And The user should see the created item details of the Capability
        
    @Read
    Scenario: Read Capability details from the table
        Given An "active" "Capability" exists
        When I go to "/#/hmws/capabilities"
        Then I should "see" the details of the "Capabilities" in the table

#     @EditCapability
#     Scenario: Edit a Capability
#         Given I have an existing "Capability"
#             And I am on "/#/hmws/capabilities"
#         When I "edit" a "Capability"
#         Then I should "see" the details of the "Capabilities" in the table
#             And I should see the "updated" item details of the "Capability" 
        
#     @DeleteCapability
#     Scenario: Delete a Capability
#         Given I have an existing "Capability"
#             And I am on "/#/hmws/capabilities"
#         When I "delete" a "Capability"
#         Then I should "not see" the details of the "Capability" in the table