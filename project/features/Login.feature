@Login
Feature: Login
    As a user
    I should be able to login agents with different roles 

    Scenario Outline: Login as <role>
        Given The user is on the Login page
            When The user logs in as <role>
            Then The user should be redirected to the Dashboard page
                And The user should be <authState> as an <role>

    @Login_Admin
    Scenarios:
    | role              | authState    |
    | Admin             | logged in    |
    | Inventory         | logged in    |    