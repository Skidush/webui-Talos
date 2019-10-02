import { ElementFinder, ElementArrayFinder, promise, browser, protractor } from "protractor";
import { Stopwatch } from "ts-stopwatch";

import { ElementCommand, ElementCommandCycle, WebDriverError } from '../helpers/helper.exports';
import { ElementUtil, Application } from "../utils/utils.exports";

const log = Application.log(`WebuiElement`);
const EC = protractor.ExpectedConditions;

export class WebuiElement {
  readonly $element: ElementFinder;
  readonly timeout: number;
  readonly selector: string;
  constructor(elementFinder: ElementFinder | WebuiElement) {
    this.$element = elementFinder.constructor.name === 'ElementFinder' 
                    ? <ElementFinder> elementFinder : <ElementFinder> elementFinder.$element;
    this.timeout = this.$element.browser_.allScriptsTimeout;
    this.selector = ElementUtil.selector(this.$element);
  }

  private _initializeStopWatch(timeout: number, command: ElementCommand, commandCycle: ElementCommandCycle) {
    browser.params.originalTime = browser.params.originalTime || timeout || this.timeout;
    log.debug(`Original time: ${browser.params.originalTime}, Timeout: ${timeout}`);
    ElementUtil.checkTimeout(timeout, this.selector, command, commandCycle);

    const stopWatch = new Stopwatch();
    stopWatch.start();

    return stopWatch;
  }

  to = {
    be: {
      /**
       * Waits for the presence of the element
       * 
       * @param $el the element being tested
       * @param timeout the time, in milliseconds, for waiting the element to meet the condition
       * @returns a boolean promise that will resolve to true if present
       * @throws an exception if the element is not present
       */
      present: async (timeout: number = this.timeout): Promise<boolean> => {
        const stopWatch = this._initializeStopWatch(timeout, ElementCommand.CHECK_PRESENCE, ElementCommandCycle.WAIT);

        log.debug(`Checking the presence of the element => '${this.selector}'`);
        await browser.wait(EC.presenceOf(this.$element), timeout).catch(async (error) => {
            error = <Error> error;
            
            if (error.name === WebDriverError.STALE_ELEMENT) {
              log.warn(`Exception caught: ${WebDriverError.STALE_ELEMENT}. Retrying...`)
              this.to.be.present(timeout - stopWatch.getTime());
            } else {
              error = error.toString().split(":");
              const ex = `No element found '${this.selector}'. ${error[1]}`;

              log.error(ex);
              log.trace(ex);
              throw ex; 
            }
        });

        log.debug(`Element '${this.selector}' is present`);
        return true;
      },

      /**
       * Waits for the staleness of the element
       * 
       * @param el the element being tested
       * @param timeout the time, in milliseconds, for waiting the element to meet the condition
       * @returns a boolean promise that will resolve to true if stale
       * @throws an exception if the element is not present
       */
      stale: async (timeout: number = this.timeout): Promise<boolean> => {
        await browser.wait(EC.stalenessOf(this.$element), timeout).catch(error => {
          error = error.toString().split(":");
          error = `Element '${this.selector}' still exists in the DOM. ${error[1]}`
          log.error(error)
          throw error;
        });

        log.debug(`Element '${this.selector}' is stale`);
        return true;
      },

      /**
       * Waits for the clickability of element
       *
       * @param el the element being tested
       * @param timeout the time, in milliseconds, for waiting the element to meet the condition
       * @returns a boolean promise that will resolve to true if clickable
       * @throws an exception if the element is not present
       */
      clickable: async (timeout: number = this.timeout): Promise<boolean> => {
        const stopWatch = this._initializeStopWatch(timeout, ElementCommand.CHECK_PRESENCE, ElementCommandCycle.WAIT);

        log.debug(`Checking the clickability of the element => '${this.selector}'`);
        await browser.wait(EC.elementToBeClickable(this.$element), timeout).catch(async error => {
          error = <Error> error;
          const _remainingTime = timeout - stopWatch.getTime();

          if (error.name === WebDriverError.NO_SUCH_ELEMENT) {
            await this.to.be.present(_remainingTime);
            log.debug(`Element '${this.selector}' is not clickable. Retrying...`);
            await this.to.be.clickable(_remainingTime);
          }
          
          throw `Element ${this.selector} is not clickable. ${error.toString().split(":")}`;
        });

        log.debug(`Element '${this.selector}' is clickable`);
        return true;
      },

      /**
       * Retrieves the page visibility of the element
       *
       * @param $el the element being tested
       * @param timeout the time, in milliseconds, for waiting the element to meet the condition
       * @returns a boolean promise that will resolve to true if displayed
       * @throws an exception if the element is not present
       */
      displayed: async (timeout: number = this.timeout): Promise<boolean> => {  
        const stopWatch = this._initializeStopWatch(timeout, ElementCommand.CHECK_DISPLAY, ElementCommandCycle.RETRY);

        await this.$element.isDisplayed().then(() => {}, async (error: Error) => {
          const _remainingTime = timeout - stopWatch.getTime();
          switch(error.name) {
            case WebDriverError.NO_SUCH_ELEMENT:
                log.debug(`Element '${this.selector}' is not present. Presence is required to acquire display state. Retrying...`);
              await this.to.be.present(_remainingTime);
            case WebDriverError.STALE_ELEMENT:
              log.debug(`Element '${this.selector}' is not displayed. Retrying...`);
              await this.to.be.displayed(_remainingTime);
              break;
            default:
              throw error;
          }
        });

        log.debug(`Element '${this.selector}' is displayed`);
        return true;
      }
    }
  }

  /**
  * Retrieves the locator of the Webui wrapped element
  * 
  * @returns the locator of the webui element
  */
  get locator(): string {
    return this.$element.parentElementArrayFinder.locator_;
  }

  /**
   * Scrolls the element into view
   * 
   * @param timeout the time window in milliseconds to execute the event
   */
  async scrollIntoView(timeout: number = this.timeout): promise.Promise<unknown> {
    const isDisplayed: boolean = await this.to.be.displayed(timeout);
    
    if (!isDisplayed) {
      return browser.executeScript("arguments[0].scrollIntoView()", await this.$element.getWebElement());
    }
  }

  /**
   * Sends a request to get an attribute of the specified element 
   * 
   * @param $el the element to click
   * @param attribute the attribute to get
   * @param timeout the time window in milliseconds to execute the event
   */
  async getAttribute(attribute: string, $el: ElementFinder = this.$element, timeout: number = this.timeout): Promise<string> {
    browser.params.originalTime = browser.params.originalTime || timeout;
    let att;
    
    ElementUtil.checkTimeout(timeout, $el.parentElementArrayFinder.locator_, ElementCommand.GET_ATTRIBUTE, ElementCommandCycle.RETRY);

    let stopWatch = new Stopwatch();
    stopWatch.start();
    
    await $el.getAttribute(attribute).then(async (attribute) => {
      att = attribute;
      att || await this.getAttribute(attribute, $el, timeout - stopWatch.getTime());
    }, async (error: Error) => {
      switch(error.name) {
        case WebDriverError.NO_SUCH_ELEMENT:
          await this.to.be.present();
        case WebDriverError.STALE_ELEMENT:
          await this.getAttribute(attribute, $el, timeout - stopWatch.getTime());
          break;
        default:
          throw error;
      }
    });

    return att;
  }

  /**
   * Sends a request to get the innerText of the specified element 
   * 
   * @param $el the element/elements to extract the text from
   * @param timeout the time window in milliseconds to execute the event
   * @returns a promise representing the text extracted from the element/elements
   */
  async getText($el: ElementFinder | ElementArrayFinder = this.$element, timeout: number = this.timeout): Promise<string> {
    browser.params.originalTime = browser.params.originalTime || timeout;
    let text;
    const selector = ElementUtil.selector($el);
    
    ElementUtil.checkTimeout(timeout, selector, ElementCommand.GET_TEXT, ElementCommandCycle.RETRY);

    let stopWatch = new Stopwatch();
    stopWatch.start();
    
    await $el.getText().then((eleText) => {
      text = eleText;
    }, async (error: Error) => {
      switch(error.name) {
        case WebDriverError.NO_SUCH_ELEMENT:
          await this.to.be.present();
        case WebDriverError.STALE_ELEMENT:
            await this.getText($el, timeout - stopWatch.getTime());
          break;
        default:
          throw error;
      }
    });

    return text;
  }

  /**
   * Sends a click event to the specified element 
   *
   * @param $el the element to click
   * @param timeout the time window in milliseconds to execute the event
   * @returns a promise representing the action of the event
   */
  async click($el: ElementFinder = this.$element, timeout: number = this.timeout): promise.Promise<this> {
    const selector = ElementUtil.selector($el);
    log.debug(`Element to click => '${selector}'`);

    browser.params.originalTime = browser.params.originalTime || timeout;
    log.debug(`Original time: ${browser.params.originalTime}, Timeout: ${timeout}`);
    ElementUtil.checkTimeout(timeout, selector, ElementCommand.CLICK, ElementCommandCycle.RETRY);

    let stopWatch = new Stopwatch();
    stopWatch.start();
    
    await $el.click().then(() => {}, async (error: Error) => {
      if (error.name === WebDriverError.NO_SUCH_ELEMENT) {
        await this.to.be.present();
        await this.click($el, timeout - stopWatch.getTime());
      } else if (error.message.includes(WebDriverError.INDEX_OUT_OF_BOUND) || error.message.includes(WebDriverError.NOT_CLICKABLE)) {
        log.warn(`WebDriver error caught: ${error.message}. Retrying the action`);          
        await this.click($el, timeout - stopWatch.getTime());
      } else {
        throw error;
      }
    });
    
    log.debug(`Element '${selector}' was clicked`);
    return this;
  }

  /**
   * Clears the text (not value) of the specified field
   *
   * @param $el the element of the field
   * @param timeout the time window in milliseconds to execute the event
   * @returns a promise representing the action of the event
   */
  async clear($el: ElementFinder = this.$element, timeout: number = this.timeout): promise.Promise<this> {
    const selector = ElementUtil.selector($el);
    log.debug(`Element to clear => '${selector}'`);
    
    browser.params.originalTime = browser.params.originalTime || timeout;
    log.debug(`Original time: ${browser.params.originalTime}, Timeout: ${timeout}`);

    ElementUtil.checkTimeout(timeout, selector, ElementCommand.CLEAR, ElementCommandCycle.RETRY);

    const stopWatch = new Stopwatch();
    stopWatch.start();
    log.debug(`Sending key strokes to clear the element`);

    await $el.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "a")).then(async () => {
      await $el.sendKeys(protractor.Key.BACK_SPACE);
    }, async (error: Error) => {
      switch(error.name) {
        case WebDriverError.NO_SUCH_ELEMENT:
          await this.to.be.present();
        case WebDriverError.NOT_CLICKABLE:
            await this.clear($el, timeout - stopWatch.getTime());
            break;
        default:
          throw error;
      }
    });

    log.debug(`Element '${selector}' innerText cleared`);
    return this;
  }
  
  /**
   * Sends key strokes to the element specified
   *
   * @param keys the keys to send to the element
   * @param $el the element of the field
   * @param timeout the time window in milliseconds to execute the event
   * 
   * @returns a promise representing the action of the event
   */
  async sendKeys(keys: string, $el: ElementFinder = this.$element, timeout: number = this.timeout): promise.Promise<this> {
    browser.params.originalTime = browser.params.originalTime || timeout;

    ElementUtil.checkTimeout(timeout, $el.parentElementArrayFinder.locator_, ElementCommand.SEND_KEYS, ElementCommandCycle.RETRY);

    const stopWatch = new Stopwatch();
    stopWatch.start();

    await $el.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "a")).then(async () => {
      await $el.sendKeys(keys);
    }, async (error: Error) => {
      if (error.name === WebDriverError.NO_SUCH_ELEMENT) {
        await this.to.be.present();
        await this.sendKeys(keys, $el, timeout - stopWatch.getTime());
      } else if (error.name === WebDriverError.STALE_ELEMENT || error.message.includes(WebDriverError.NOT_CLICKABLE)) {
        await this.sendKeys(keys, $el, timeout - stopWatch.getTime());
      } else {
        throw error;
      }
    });

    return this;
  }
}