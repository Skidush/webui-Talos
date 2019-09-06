import { element, by, ElementFinder, browser } from "protractor";
import * as _ from "lodash";

import { GetElementBy, WebuiElement, ElementToBe, FormField } from "../helpers/helper.exports";
import { ElementUtil } from "../utils/element.utils";
import { Application } from "../utils/utils.exports";

export enum FormPageElement {
  BUTTON = 'webuilib-item-job-form button[id="{ID}"]',
  FORM_HEADER = 'webuilib-item-job-form h2',
  FORM_PANEL = 'webuilib-item-job-form',
  FIELD_CAPTION = 'webuilib-item-job-form label[for="{FOR}"]'
}

export class FormPage {
    static _button(buttonID: string): Promise<WebuiElement> {
      return GetElementBy.elementFinder(element(by.css(ElementUtil.buildSelector(FormPageElement.BUTTON, buttonID))));
    }

    static _fieldCaption(caption: string): Promise<WebuiElement> {
      return GetElementBy.elementFinder(element(by.css(ElementUtil.buildSelector(FormPageElement.FIELD_CAPTION, caption))));
    }

    static get _formHeader(): Promise<WebuiElement> {
      return GetElementBy.elementFinder(element(by.css(FormPageElement.FORM_HEADER)));
    }

    static get _formPanel(): Promise<WebuiElement> {
      return GetElementBy.elementFinder(element(by.css(FormPageElement.FORM_PANEL)));
    }

    static async compareFormHeader(expectedHeader: string, _formHeader: ElementFinder | WebuiElement): Promise<boolean> {
      const formHeaderText = await _formHeader.getText();
      return expectedHeader === formHeaderText;
    }

    static async compareFieldCaption(captionFor: string, expectedCaption: string): Promise<boolean> {
      const log = Application.log(`FormPage(compareFieldCaption) => Comparing caption`);
      log.debug(`Caption For value: ${captionFor}, Expected caption: ${expectedCaption}`);

      return await this._fieldCaption(captionFor).then(async (_el) => {
        log.debug(`Caption with For value: ${captionFor} found`);
        const caption = await _el.getText();
        if (caption !== expectedCaption) {
          log.warn(`The found caption: "${caption}" for the field ${captionFor} does not match the specified caption "${expectedCaption}"`);
          return false;
        }
      }).catch(_err => {
        log.warn(`The caption "${expectedCaption}" for the field ${captionFor} was not found`);
        return true;
      });
    }

    static async fill(formSchemaWithValues: any, timeout: number = browser.allScriptsTimeout) {
      const log = Application.log(`FormPage(fill) => Fill out form`);
      for (let details of formSchemaWithValues) {
        log.info('Checking the field caption');
        this.compareFieldCaption(details.ID, details.caption);

        const _formEl = await GetElementBy.elementFinder(element(by.id(details.ID)), timeout);
        details.el = _formEl;
        switch (details.field) {
          case FormField.TEXTAREA:
          case FormField.INPUT:
          case FormField.AUTOCOMPLETE_INPUT:
            await _formEl.clear();
            await _formEl.sendKeys(details.value);
            break;
          case FormField.DATE:
            const dateField = new WebuiElement(_formEl.nativeElement.element(by.tagName('input')));
            const datePickerBtn = new WebuiElement(_formEl.nativeElement.element(by.className('ui-datepicker-trigger')));
            await dateField.clear();
            log.info(`${dateField.locator} field cleared`);
            await dateField.sendKeys(details.value);
            log.info(`"${details.value}" entered in the ${details.field}[${details.ID}] field`);
            await datePickerBtn.click();
            log.info(`${details.field} button ${_formEl.locator} clicked`);
            break;
          case FormField.AUTOCOMPLETE_DROPDOWN:
            // TODO: Select random data in autocomplete-dropdown
            const autocompleteField = new WebuiElement(_formEl.nativeElement.element(by.css('input.ui-dropdown-label')));
            await autocompleteField.clear();
            await autocompleteField.sendKeys(details.value);
            break;
          case FormField.DROPDOWN:
            // TODO Update script ref needs time to populate the field
            await browser.sleep(1200);
            const dropdownDiv = new WebuiElement(_formEl.nativeElement.element(by.className('ui-dropdown')));
            const dropdownClass = await dropdownDiv.getAttribute('class');
  
            if (dropdownClass.includes('ui-state-disabled')) {
              const elText = await dropdownDiv.getText();
              details.value = elText;
              break;
            }
  
            await _formEl.click();
            const dropdownList = element.all(by.className('ui-dropdown-item'));
  
            let dropdownItem;
            if (details.value === 'random') {
              const randomIndex = _.random(1, await dropdownList.count() - 1);
              await ElementToBe.present(dropdownList.get(randomIndex), timeout);
              dropdownItem = new WebuiElement(dropdownList.get(randomIndex));
              details.value = await dropdownItem.getText();
            } else {
              dropdownItem = await GetElementBy.cssWithExactText(dropdownList, details.value, timeout);
            }
            await dropdownItem.click();
            break;  
        }
      }
      return formSchemaWithValues;
  }
}