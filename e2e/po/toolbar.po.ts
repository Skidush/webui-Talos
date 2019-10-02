import { $, ElementFinder } from 'protractor';
import { WebuiElement } from '../classes/classes.exports';
import { GetElementBy } from '../helpers/helper.exports';
import { ElementUtil } from '../utils/utils.exports';

export enum ToolbarPageElement {
    DIALOG ='webuilib-item-toolbar p-dialog div[role="dialog"]',
    DIALOG_MESSAGE = 'webuilib-item-toolbar p-dialog div[role="dialog"]',
    DIALOG_BUTTON = 'webuilib-item-toolbar p-dialog div[role="dialog"] div.ui-dialog-footer p-footer button[label="{LABEL}"]',
    BUTTON = 'webuilib-item-toolbar p-toolbar button[id="{ID}"]',
    SPLIT_BUTTON = 'webuilib-item-toolbar p-toolbar p-splitbutton[id="{ID}"]'
}
export class ToolbarPage {
    static async $toolbarButton(button: any): Promise<WebuiElement> {
        let $subButton;
        if (button.constructor.name === 'Object') {
            const buttonID = Object.keys(button)[0];
            const $splitButton = this.$splitButton(buttonID);
            await $splitButton.click();

            $subButton = await this.$splitButtonSubButton($splitButton.$element, button[buttonID]);
        } else if (button.constructor.name === 'String') {
            $subButton = this.$button(button);
        }

        return $subButton;
    }

    static $button(buttonID: string): WebuiElement {
        return new WebuiElement($(ElementUtil.buildSelector(ToolbarPageElement.BUTTON, buttonID)));
    }

    static $splitButton(buttonID: string): WebuiElement {
        return new WebuiElement($(ElementUtil.buildSelector(ToolbarPageElement.SPLIT_BUTTON, buttonID)));
    }

    static $splitButtonSubButton($splitButton: ElementFinder, subButtonCaption: string): Promise<WebuiElement> {
        return GetElementBy.cssWithExactText($splitButton.$$('li'), subButtonCaption);
    }

    static $dialogButton(buttonLabel: string): WebuiElement {
        return new WebuiElement($(ElementUtil.buildSelector(ToolbarPageElement.SPLIT_BUTTON, buttonLabel)));
    }

    static get $dialog(): WebuiElement {
        return new WebuiElement($(ToolbarPageElement.DIALOG));
    }

    static get $dialogMessage(): WebuiElement {
        return new WebuiElement($(ToolbarPageElement.DIALOG_MESSAGE));
    }

}