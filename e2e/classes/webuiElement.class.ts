import { ElementFinder, ElementArrayFinder, promise } from "protractor";

import { ElementAction } from '../helpers/helper.exports';

export class WebuiElement implements ElementAction {
  private _actions: ElementAction;
  readonly _element: ElementFinder;
  readonly _elements: ElementArrayFinder;
  readonly _elementTimeout: number;
  constructor(_el: ElementFinder | ElementArrayFinder) {
    //TODO Move to an enum
    if (_el.constructor.name === 'ElementFinder') {
      this._element = _el as ElementFinder;
    } else {
      this._elements = _el as ElementArrayFinder;
    }

    this._elementTimeout = _el.browser_.allScriptsTimeout
    this._actions = new ElementAction(_el);
  }

  async scrollIntoView(): promise.Promise<unknown> {
    return this._actions.scrollIntoView();
  }

  /**
   * Sends a request to get the innerText of the specified element 
   * @param attribute the attribute to get
   */
  async getAttribute(attribute: string): Promise<string> {
    return this._actions.getAttribute(attribute);
  }

  async getText(): Promise<string> {
    return this._actions.getText();
  }

  async click(): Promise<ElementAction> {
    return this._actions.click();
  }

  async clear(): Promise<ElementAction> {
    return this._actions.clear();
  }
  
  /**
   * Sends key strokes to the specified element
   * @param keys the keys to send to the element
   */
  async sendKeys(keys: string): Promise<ElementAction> {
    return this._actions.sendKeys(keys);
  }
  
  /**
   * Retrieves the native element of the Webui wrapped element
   * @returns the unwrapped webui element
   */
  get nativeElement(): ElementFinder {
    return this._element;
  }

  /**
   * Retrieves the native elements of the Webui wrapped elements
   * @returns the unwrapped webui elements
   */
  get nativeElements(): ElementArrayFinder {
    return this._elements;
  }

  /**
  * Retrieves the locator of the Webui wrapped element
  * @returns the locator of the webui element
  */
  get locator(): string {
    return this._element.parentElementArrayFinder.locator_;
  }
}