import { ElementFinder, element, by, ElementArrayFinder } from "protractor";

import { ElementToBe } from '../helper.exports';
import { WebuiElement } from '../../classes/classes.exports';

export class GetElementBy {
  /**
   * Retrieves all elements with the specified css that contains the text
   * 
   * @param cssSelector the css selector of the element
   * @param text the text contained by the css
   * @param timeout the time to wait for the element in milliseconds
   * 
   * @returns a promise that represents the first element with the specified css which contains the text wrapped in WebuiElement
   */
  static async allElementsContainingText(cssSelector: string, text: string, timeout?: number): Promise<WebuiElement> {
    const _el = element.all(by.cssContainingText(cssSelector, text));
    await ElementToBe.present(_el.first(), timeout);

    return new WebuiElement(_el);
  }

  /**
   * Checks the presence of the ElementFinder and returns the element wrapped as WebuiElement
   *
   * @param _el the ElementFinder to wrap and get
   * @param timeout the time to wait for the element in milliseconds
   * @returns a promise that represents the present element wrapped in WebuiElement
   */
  static async elementFinder(_el: ElementFinder | ElementArrayFinder, timeout?: number): Promise<WebuiElement> {
    await ElementToBe.present(_el.constructor.name === 'ElementFinder' ? _el : _el.first(), timeout);
    return new WebuiElement(_el);
  }

  /**
   * Retrieves the element with the specified css and its exact text
   *
   * @param el the elements to search for the specific text 
   * @param text the inner text contained by the element
   * @param timeout the time to wait for the element in milliseconds
   * 
   * @returns a promise representing the element with the exact text wrapped in WebuiElement
   */
  static async cssWithExactText(_el: ElementArrayFinder, text: string, timeout?: number): Promise<WebuiElement> {
    await ElementToBe.present(_el.first(), timeout);
    const elCount = await _el.count();

    let _elFound: WebuiElement;
    for (let index = 0; index < elCount; index++) {
      const _webuiEl = new WebuiElement(_el.get(index));
      await _webuiEl.scrollIntoView();

      let elText = await _webuiEl.getText();
      elText = elText.replace(/\s+/g, '');
      text = text.replace(/\s+/g, '');
      
      if (text === elText) {
        _elFound = _webuiEl;    
        break;
      }
    }

    if (!_elFound) {
      throw `No element found that contains the text: ${text}`;
    }
  
    return _elFound;
  }
}