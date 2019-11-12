@PurchaseOrder
Feature: Purchase Order
    As an Admin
    I should be able to Create, Read, Update, and Delete a Purchase Order.

    Background: User is logged in as an Admin
        Given The user is logged in as an Admin

    # @Create
    # Scenario: Create a Purchase Order
    #     Given The user is on the Purchase Orders page
    #     When The user creates a Purchase Order
    #     Then The user should be redirected to the details page of the created Purchase Order
    #         And The user should see the created details of the Purchase Order
        
    @Read
    Scenario: Read Purchase Order details from the list
        Given An ACTIVE Purchase Order exists
        When The user navigates to the Purchase Orders page
        Then The user should see the details of the Purchase Orders in the table

    # @Read
    # Scenario: Read Purchase Order details from its page
    #     Given An ACTIVE Purchase Order exists
    #     When The user navigates to the ACTIVE Purchase Orders page
    #     Then The user should see the details of the ACTIVE Purchase Order

    # @Edit
    # Scenario: Edit a Purchase Order from the list
    #     Given An ACTIVE Purchase Order exists
    #         And The user is on the Purchase Orders page
    #     When The user edits a Purchase Order
    #     Then The user should see the details of the edited Purchase Orders in the table

    # @Edit
    # Scenario: Edit a Purchase Order from its page
    #     Given An ACTIVE Purchase Order exists
    #         And The user navigates to the ACTIVE Purchase Orders page
    #     When The user edits the Purchase Order
    #     Then The user should see the edited details of the Purchase Order

    # @Delete
    # Scenario: Delete a Purchase Order from its page
    #     Given An ACTIVE Purchase Order exists
    #         And The user navigates to the ACTIVE Purchase Orders page
    #     When The user deletes the Purchase Order
    #     Then The user should be not be able to execute further actions on the Purchase Order

    # @Delete
    # Scenario: Delete a Purchase Order
    #     Given An ACTIVE Purchase Order exists
    #         And The user is on the Purchase Orders page
    #     When The user deletes a Purchase Order
    #     Then The user should not see the details of the deleted Purchase Orders in the table