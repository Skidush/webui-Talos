import { ElementArrayFinder } from "protractor";

import { WebuiElement } from '../../classes/classes.exports';
import { Application, ElementUtil } from "../../utils/utils.exports";

const log = Application.log('GetElementBy');
export class GetElementBy {
  /**
   * Retrieves the element with the specified css and its exact text
   *
   * @param el the elements to search for the specific text 
   * @param text the inner text contained by the element
   * @param timeout the time to wait for the element in milliseconds
   * 
   * @returns a promise representing the element with the exact text wrapped in WebuiElement
   */
  static async cssWithExactText($$elements: ElementArrayFinder, text: string, timeout: number = $$elements.browser_.allScriptsTimeout): Promise<WebuiElement> {
    const selector = ElementUtil.selector($$elements);
    log.debug(`Searching for element with the text '${text}' from '${selector}'`);

    const whiteSpace = /\s+/g;
    await new WebuiElement($$elements.first()).to.be.present(timeout);
    const foundIndex = (<any> (await $$elements.getText())).findIndex(elementText => elementText.replace(whiteSpace, '') === text.replace(whiteSpace, ''));

    if (foundIndex) {
      log.debug(`Element with text '${text}' within the elements '${selector}' was found at index ${foundIndex}`);
      return new WebuiElement($$elements.get(foundIndex));
    } else {
      const errorMsg = `No element found within the elements '${selector} that contains the text '${text}'`;
      log.error(errorMsg);
      throw errorMsg;
    }
    
  }
}