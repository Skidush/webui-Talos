import { ElementFinder, browser, promise, protractor } from "protractor";
import { Stopwatch } from "ts-stopwatch";

import { ElementCommand, ElementCommandCycle, WebDriverError } from '../helper.exports';
import { ElementUtil } from '../../utils/element.utils';
import { Application } from '../../utils/application.utils';

const EC = protractor.ExpectedConditions;
const log = Application.log(`Element to be`);

export class ElementToBe {
    /**
     * Waits for the presence of the element
     * @param _el the element being tested
     * @param timeout the time, in milliseconds, for waiting the element to meet the condition
     * @returns a promise that will represent the presence of the element
     */
    static async present(_el: ElementFinder, timeout: number = _el.browser_.allScriptsTimeout): promise.Promise<unknown> {
        const selector = ElementUtil.selector(_el);

        browser.params.originalTime = browser.params.originalTime || timeout || _el.browser_.allScriptsTimeout;
        log.debug(`Original time: ${browser.params.originalTime}, Timeout: ${timeout}`);
        ElementUtil.checkTimeout(timeout, selector, ElementCommand.CHECK_PRESENCE, ElementCommandCycle.WAIT);
    
        let stopWatch = new Stopwatch();
        stopWatch.start();
    
        log.debug(`Checking the presence of the element => '${selector}'`);
        await browser.wait(EC.presenceOf(_el), timeout).catch(async (error) => {
            let _error: Error = <Error> error;
            if (_error.message.includes(WebDriverError.STALE_ELEMENT)) {
                log.warn(`Exception caught: ${WebDriverError.STALE_ELEMENT}. Retrying...`)
                this.present(_el, timeout - stopWatch.getTime());
            } else {
                error = error.toString().split(":");
                const ex = `No element found '${selector}'. ${error[1]}`;

                log.error(ex);
                throw ex; 
            }
        });

        log.debug(`Element '${selector}' is present`);
        return this;
    }
  
    /**
     * Waits for the staleness of the element
     * @param el the element being tested
     * @param timeout the time, in milliseconds, for waiting the element to meet the condition
     * @returns a promise that will represent the staleness of the element
     */
    static stale(_el: ElementFinder, timeout: number = _el.browser_.allScriptsTimeout): promise.Promise<unknown> {
        return browser.wait(EC.stalenessOf(_el), timeout).catch(err => {
            err = err.toString().split(":");
            const error = `Element '${ElementUtil.selector(_el)}' still exists in the DOM. ${err[1]}`
            log.error(error)
            throw error;
        });
    }
  
    /**
     * Waits for the clickability of element
     *
     * @param el the element being tested
     * @param timeout the time, in milliseconds, for waiting the element to meet the condition
     *
     * @returns a promise that will represent the clickability of the element
     */
    static clickable(_el: ElementFinder, timeout: number = _el.browser_.allScriptsTimeout) {
        return browser.wait(EC.elementToBeClickable(_el), timeout).catch(err => {
            err = err.toString().split(":");
            throw `Element ${_el.parentElementArrayFinder.locator_} is not clickable. ${err[1]}`;
        });
    }
  
    /**
     * Retrieves the page visibility of the element
     *
     * @param _el the element being tested
     * @param timeout the time, in milliseconds, for waiting the element to meet the condition
     *
     * @returns a promise that will represent the page visibility of the element
     */
    static async displayed(_el: ElementFinder, timeout?: number): Promise<boolean> {
        browser.params.originalTime = browser.params.originalTime || timeout || _el.browser_.allScriptsTimeout;
        let isDisplayed;
    
        ElementUtil.checkTimeout(timeout, _el.parentElementArrayFinder.locator_, ElementCommand.CHECK_DISPLAY, ElementCommandCycle.RETRY);
    
        let stopWatch = new Stopwatch();
        stopWatch.start();
        
        await _el.isDisplayed().then((isDisplayedBool) => {
            isDisplayed = isDisplayedBool;
        }, async (error) => {
            let _error: Error = <Error>error;
    
            if (_error.message.includes(WebDriverError.STALE_ELEMENT)) {
                await this.displayed(_el, timeout - stopWatch.getTime());
            } else {
                throw _error;
            }
        });
    
        return isDisplayed;
    }
  }