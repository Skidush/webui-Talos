import { ElementFinder, ElementArrayFinder, protractor, browser, promise } from "protractor";
import { Stopwatch } from "ts-stopwatch";

import { ElementToBe, ElementCommand, ElementCommandCycle, WebDriverError } from '../helper.exports';
import { ElementUtil } from '../../utils/element.utils';
import { Application } from '../../utils/application.utils'

const log = Application.log(`Element action`);

//TODO change ElementAction to a more appropriate name
export class ElementAction {
    readonly _element: ElementFinder;
    readonly _elements: ElementArrayFinder;
    readonly _elementTimeout: number;
    constructor(element: ElementFinder | ElementArrayFinder) {
      if (element.constructor.name === 'ElementFinder') {
        this._element = element as ElementFinder;
      } else {
        this._elements = element as ElementArrayFinder;
      }
  
      this._elementTimeout = element.browser_.allScriptsTimeout
    }
  
    /**
     * Scrolls the element into view
     * 
     * @param timeout the time window in milliseconds to execute the event
     */
    async scrollIntoView(timeout: number = this._elementTimeout): promise.Promise<unknown> {
      const isDisplayed: boolean = await ElementToBe.displayed(this._element, timeout);
      
      if (!isDisplayed) {
        return browser.executeScript("arguments[0].scrollIntoView()", await this._element.getWebElement());
      }
    }
  
    /**
     * Sends a request to get the innerText of the specified element 
     * 
     * @param _el the element to click
     * @param attribute the attribute to get
     * @param timeout the time window in milliseconds to execute the event
     */
    async getAttribute(attribute: string, _el: ElementFinder = this._element, timeout: number = this._elementTimeout): Promise<string> {
      browser.params.originalTime = browser.params.originalTime || timeout;
      let att;
      
      ElementUtil.checkTimeout(timeout, _el.parentElementArrayFinder.locator_, ElementCommand.GET_ATTRIBUTE, ElementCommandCycle.RETRY);
  
      let stopWatch = new Stopwatch();
      stopWatch.start();
      
      await _el.getAttribute(attribute).then(async (attribute) => {
        att = attribute;
        att || await this.getAttribute(attribute, _el, timeout - stopWatch.getTime());
      }, async (error) => {
        let _error: Error = <Error>error;
  
        if (_error.message.includes(WebDriverError.STALE_ELEMENT)) {
          await this.getAttribute(attribute, _el, timeout - stopWatch.getTime());
        } else {
          throw _error;
        }
      });
  
      return att;
    }
  
    /**
     * Sends a request to get the innerText of the specified element 
     * 
     * @param _el the element/elements to extract the text from
     * @param timeout the time window in milliseconds to execute the event
     * @returns a promise representing the text extracted from the element/elements
     */
    async getText(_el: ElementFinder | ElementArrayFinder = this._element || this._elements, timeout: number = this._elementTimeout): Promise<string> {
      browser.params.originalTime = browser.params.originalTime || timeout;
      let text;
      
      ElementUtil.checkTimeout(timeout, _el.parentElementArrayFinder.locator_, ElementCommand.GET_TEXT, ElementCommandCycle.RETRY);
  
      let stopWatch = new Stopwatch();
      stopWatch.start();
      
      await _el.getText().then((eleText) => {
        text = eleText;
      }, async (error) => {
        let _error: Error = <Error>error;
  
        if (_error.message.includes(WebDriverError.STALE_ELEMENT)) {
          await this.getText(_el, timeout - stopWatch.getTime());
        } else {
          throw _error;
        }
      });
  
      return text;
    }
  
    /**
     * Sends a click event to the specified element 
     *
     * @param _el the element to click
     * @param timeout the time window in milliseconds to execute the event
     * @returns a promise representing the action of the event
     */
    async click(_el: ElementFinder = this._element, timeout: number = this._elementTimeout): Promise<ElementAction> {
      const selector = ElementUtil.selector(_el);
      log.debug(`Element to click => '${selector}'`);

      browser.params.originalTime = browser.params.originalTime || timeout;
      log.debug(`Original time: ${browser.params.originalTime}, Timeout: ${timeout}`);
      ElementUtil.checkTimeout(timeout, selector, ElementCommand.CLICK, ElementCommandCycle.RETRY);
  
      let stopWatch = new Stopwatch();
      stopWatch.start();
      
      await _el.click().then(() => {}, async (error) => {
        let _error: Error = <Error>error;
        if (_error.message.includes(WebDriverError.NOT_CLICKABLE) || _error.message.includes(WebDriverError.INDEX_OUT_OF_BOUND)) {
          log.warn(`WebDriver error caught: ${_error.message}. Retrying the action`);          
          await this.click(_el, timeout - stopWatch.getTime());
        } else {
          throw _error;
        }
      });
      
      log.debug(`Element '${selector}' was clicked`);
      return this;
    }
  
    /**
     * Clears the text (not value) of the specified field
     *
     * @param _el the element of the field
     * @param timeout the time window in milliseconds to execute the event
     * 
     * @returns a promise representing the action of the event
     */
    async clear(_el: ElementFinder = this._element, timeout: number = this._elementTimeout): Promise<ElementAction> {
      const selector = ElementUtil.selector(_el);
      log.debug(`Element to clear => '${selector}'`);
      
      browser.params.originalTime = browser.params.originalTime || timeout;
      log.debug(`Original time: ${browser.params.originalTime}, Timeout: ${timeout}`);

      ElementUtil.checkTimeout(timeout, selector, ElementCommand.CLEAR, ElementCommandCycle.RETRY);
  
      let stopWatch = new Stopwatch();
      stopWatch.start();
      // TODO:TOFIX Sleep is needed for update script refs :(
      log.debug(`Sending key strokes to clear the element`);
      await browser.sleep(800);
      await _el.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "a")).then(async () => {
        await _el.sendKeys(protractor.Key.BACK_SPACE);
      }, async (error) => {
        let _error: Error = <Error>error;
  
        if (_error.message.includes(WebDriverError.NOT_CLICKABLE)) {
          await this.clear(_el, timeout - stopWatch.getTime());
        } else {
          throw _error;
        }
      });

      log.debug(`Element '${selector}' innerText cleared`);
      return this;
    }
    
    /**
     * Sends key strokes to the element specified
     *
     * @param keys the keys to send to the element
     * @param _el the element of the field
     * @param timeout the time window in milliseconds to execute the event
     * 
     * @returns a promise representing the action of the event
     */
    async sendKeys(keys: string, _el: ElementFinder = this._element, timeout: number = this._elementTimeout): Promise<ElementAction> {
      browser.params.originalTime = browser.params.originalTime || timeout;
  
      ElementUtil.checkTimeout(timeout, _el.parentElementArrayFinder.locator_, ElementCommand.CLEAR, ElementCommandCycle.RETRY);
  
      let stopWatch = new Stopwatch();
      stopWatch.start();

      await _el.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "a")).then(async () => {
        await _el.sendKeys(keys);
      }, async (error) => {
        let _error: Error = <Error>error;
  
        if (_error.message.includes(WebDriverError.NOT_CLICKABLE) || _error.message.includes(WebDriverError.STALE_ELEMENT)) {
          await this.clear(_el, timeout - stopWatch.getTime());
        } else {
          throw _error;
        }
      });
  
      return this;
    }
  }