import { browser, ElementFinder, ElementArrayFinder } from "protractor";
import { ElementCommand, ElementCommandCycle, SelectorParameter } from '../helpers/helper.exports';

export class ElementUtil {
    /**
     * Checks if the timeout for retrying has been exhausted.
     * Throws an error and resets the global timeout when exhausted.
     * 
     * @param timeout the time window in melliseconds for the execution of the command 
     * @param elementSelector the selector of the element
     * @param action the ElementCommand being executed
     * @throws An error relative to the action executed
     */
    static checkTimeout(timeout: number, elementSelector: string, command: ElementCommand, commandCycle: ElementCommandCycle) {
        if (timeout < 0) {
            const timeinSec = browser.params.originalTime / 1000;
            let message = commandCycle === ElementCommandCycle.RETRY 
                            ? `After ${timeinSec} seconds of retrying`
                            : `Timed out after ${timeinSec} seconds.`;
            try {
                switch (command) {
                    case ElementCommand.CLICK:
                    message = `${message}, the element ${elementSelector} was not clicked.`;
                    break;
                    case ElementCommand.GET_ATTRIBUTE:
                    message = `${message}, the attribute value for the element ${elementSelector} was not extracted.`;
                    break;
                    case ElementCommand.GET_TEXT:
                    message = `${message}, the text for the element ${elementSelector} was not extracted.`;
                    break;
                    case ElementCommand.CLEAR:
                    message = `${message}, the element ${elementSelector} was not cleared.`;
                    break;
                    case ElementCommand.CHECK_DISPLAY:
                    message = `${message}, the element ${elementSelector} was not displayed.`;
                    break;
                    case ElementCommand.CHECK_PRESENCE:
                    message = `No element found ${elementSelector}. ${message}`;
                    break;
                }
                throw message;
            } finally {
                browser.params.originalTime = 0;
            }
        }
    }

    static buildSelector(selectorWithParam: string, newString: string) {
        // type with regexp is not yet implemented by typescript, so do a check
        for (const param in SelectorParameter) {
            if (selectorWithParam.includes(SelectorParameter[param])) {
                return selectorWithParam.replace(SelectorParameter[param], newString);
            }
        }

        throw `The selector: ${selectorWithParam} - does not contain any parameters`;
    }

    static selector(_el: ElementFinder | ElementArrayFinder): string {
        return ((_el.constructor.name === 'ElementFinder' ? _el.parentElementArrayFinder.locator_ : _el.locator_).toString()).split(',')[1].replace(/.$/, '');
    }
}