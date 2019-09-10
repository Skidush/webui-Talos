@Login
Feature: Login
    As a user
    I should be able to login agents with different roles 

    Scenario Outline: Login as <role>
        Given The user is on the <page> page
            When The user logs in as <role>
            Then The user should be redirected to the <landingPage> page
                And The user should be <authState> as <role>

    @Login_Admin
    Scenarios:
    | page       | role              | landingPage       | authState    |
    | Login      | Admin             | Dashboard         | logged in    |

