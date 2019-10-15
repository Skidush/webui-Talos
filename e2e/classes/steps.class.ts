import { ParamaterUtil } from "../features/support/parameterTypes";
import { ItemState, Page, ItemActivity } from "../helpers/helper.exports";

export class Step {
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
     * The user should see the {ItemActivity}(d)(ed) details of the {Item}
     * The user should see the details of the {ItemState} {Item}
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * 
     * Description:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * Checks the details of the item in its page
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * 
     * Usage:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * The user should see the {ItemActivity} details of the {Item}
     * The user should see the details of the {ItemState} {Item}
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * Examples:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * The user should see the created details of the Employee
     * The user should see the details of the ACTIVE Employee
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    static get viewItemDetails() {
        return new RegExp(
            `^The user should see the:?\\s(${ParamaterUtil.toOrFormat(ItemActivity, false, false)}|:?\\s?)(:?d|ed)?:?\\s?details of the` 
            + `:?\\s(${ParamaterUtil.toOrFormat(ItemState, false, false)}|:?\\s?):?\\s?(${ParamaterUtil.itemNamesToOrFormat()})$`
        );
    }
}