import { by, element, ElementFinder } from 'protractor';
import { WebuiElement } from '../classes/classes.exports';
import { GetElementBy } from '../helpers/helper.exports';
import { ElementUtil } from '../utils/element.utils';

export enum ToolbarPageElement {
    DIALOG ='webuilib-item-toolbar p-dialog div[role="dialog"]',
    DIALOG_MESSAGE = 'webuilib-item-toolbar p-dialog div[role="dialog"]',
    DIALOG_BUTTON = 'webuilib-item-toolbar p-dialog div[role="dialog"] div.ui-dialog-footer p-footer button[label="{LABEL}"]',
    BUTTON = 'webuilib-item-toolbar p-toolbar button[id="{ID}"]',
    SPLIT_BUTTON = 'webuilib-item-toolbar p-toolbar p-splitbutton[id="{ID}"]'
}
export class ToolbarPage {
    static async findButton(button: any): Promise<WebuiElement> {
        let subButton;
        if (button.constructor.name === 'Object') {
            const buttonID = Object.keys(button)[0];
            const splitButton = await this._splitButton(buttonID);
            await splitButton.click();

            subButton = await this._splitButtonSubButton(splitButton.nativeElement, button[buttonID]);
        } else if (button.constructor.name === 'String') {
            subButton = await this._button(button);
        }

        return subButton;
    }

    static _button(buttonID: string): Promise<WebuiElement> {
        return GetElementBy.elementFinder(element(by.css(ElementUtil.buildSelector(ToolbarPageElement.BUTTON, buttonID))));
    }

    static _splitButton(buttonID: string): Promise<WebuiElement> {
        return GetElementBy.elementFinder(element(by.css(ElementUtil.buildSelector(ToolbarPageElement.SPLIT_BUTTON, buttonID))));
    }

    static _splitButtonSubButton(splitButton: ElementFinder, subButtonCaption: string): Promise<WebuiElement> {
        const subButtons = splitButton.all(by.tagName('li'));
        return GetElementBy.cssWithExactText(subButtons, subButtonCaption);
    }

    static _dialogButton(buttonLabel: string): Promise<WebuiElement> {
        return GetElementBy.elementFinder(element(by.css(ElementUtil.buildSelector(ToolbarPageElement.SPLIT_BUTTON, buttonLabel))));
    }

    static get _dialog(): Promise<WebuiElement> {
        return GetElementBy.elementFinder(element(by.css(ToolbarPageElement.DIALOG)));
    }

    static get _dialogMessage(): Promise<WebuiElement> {
        return GetElementBy.elementFinder(element(by.css(ToolbarPageElement.DIALOG_MESSAGE)));
    }

}