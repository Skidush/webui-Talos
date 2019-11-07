import { ParamaterUtil } from "../features/support/parameterTypes";
import { ItemState, Page, ItemActivity, View, AuthenticationState, Role } from "../helpers/helper.exports";

export class Step {
    /**
     * Expression:
     * ================================================================
     * The user (should be/is) {authenticationState} (as (a/an) {role})
     * ================================================================
     * Usage:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * The user should be {authenticationState}
     * The user should be {authenticationState} as a {role}
     * The user should be {authenticationState} as an {role}
     * The user is {authenticationState}
     * The user is {authenticationState} as a {role}
     * The user is {authenticationState} as an {role}
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * Examples:
     * ----------------------------------------------------------------
     * The user should be logged in as a Manager
     * The user is logged in as an Admin
     * ----------------------------------------------------------------
     */
    static get login() {
        return new RegExp(
            `^The user (?:should be|is) (${ParamaterUtil.toOrFormat(AuthenticationState, false, false)})` 
            + `(?:\\sas (?:an|a)\\s)(${ParamaterUtil.toOrFormat(Role, false, false)})?$`
        );
    }

    /**
     * Expression:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * The user (is on/navigates to) the ({instance}) {page} page
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * 
     * Description:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * Navigates to the instance or the page of the item.
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * 
     * Usage:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * The user is on the {page}
     * The user navigates to the {page}
     * The user navigates to the ({instance}) {page}
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * Examples:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * The user is on the Employees page
     * The user navigates to the Employees page
     * The user navigates to the existing Employees page
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    static get navigateToItemPage() {
        return new RegExp(
            `^The user (?:is on|navigates to) the:?\\s?(${ParamaterUtil.toOrFormat(ItemState, false, false)}|\\s)?` 
            + ` (${ParamaterUtil.toOrFormat(Page, true, false)}) page$`
        );
    }
    
    /**
     * Expression:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * The user should {view} the {ItemActivity}(d)(ed) details of the {Item}
     * The user should {view} the details of the {ItemState} {Item}
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * 
     * Description:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * Checks the details of the item in its page
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * 
     * Usage:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * The user should {view} the {ItemActivity} details of the {Item}
     * The user should {view} the details of the {ItemState} {Item}
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * Examples:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * The user should see the created details of the Employee
     * The user should not see the details of the ACTIVE Employee
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    static get viewItemDetails() {
        return new RegExp(
            `^The user should see the:?\\s(${ParamaterUtil.toOrFormat(ItemActivity, false, false)}|:?\\s?)(:?d|ed)?:?\\s?details of the` 
            + `:?\\s(${ParamaterUtil.toOrFormat(ItemState, false, false)}|:?\\s?):?\\s?(${ParamaterUtil.itemNamesToOrFormat})$`
        );
    }

    /**
     * Expression:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * The user should {view} the details of the {ItemActivity}(d)(ed) {Item} in the table
     * The user should {view} the details of the {Item}
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * 
     * Description:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * Checks the details of the item in its the item list
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * 
     * Usage:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * The user should {view} the details of the {ItemActivity}(d)(ed) {Item} in the table
     * The user should {view} the details of the {Item} in the table
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * Examples:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * The user should see the details of the created Employee in the table
     * The user should not see the details of the Employee in the table
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    static get viewItemsInList() {
        return new RegExp(
            `^The user should (${ParamaterUtil.toOrFormat(View, false, false)}) the details of the:?\\s(${ParamaterUtil.toOrFormat(ItemActivity, false, false)}|:?\\s?)`
            + `(:?d|ed)?:?\\s?:?\\s?(${ParamaterUtil.itemNamesToOrFormat}) in the table$`
        );
    }
}