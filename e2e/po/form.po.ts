import { $, $$, ElementFinder, browser } from "protractor";
import * as _ from "lodash";

import { WebuiElement, WebuiElements } from '../classes/classes.exports';
import { GetElementBy, FormField, SchemaField } from "../helpers/helper.exports";
import { Application, ElementUtil } from "../utils/utils.exports";

const log = Application.log(`FormPage`);

export enum FormPageElement {
  BUTTON = 'webuilib-item-job-form button[id="{ID}"]',
  HEADER = 'webuilib-item-job-form h2',
  PANEL = 'webuilib-item-job-form',
  CAPTION = 'webuilib-item-job-form label[for="{FOR}"]'
}

export class FormPage {
  static $button(buttonID: string): WebuiElement {
    return new WebuiElement($(ElementUtil.buildSelector(FormPageElement.BUTTON, buttonID)));
  }

  static $fieldCaption(caption: string): WebuiElement {
    return new WebuiElement($(ElementUtil.buildSelector(FormPageElement.CAPTION, caption)));
  }

  static get $formHeader(): WebuiElement {
    return new WebuiElement($(FormPageElement.HEADER));
  }

  static get $formPanel(): WebuiElement {
    return new WebuiElement($(FormPageElement.PANEL));
  }

  static async compareFormHeader(expectedHeader: string, formHeader: ElementFinder | WebuiElement): Promise<boolean> {
    const formHeaderText = await formHeader.getText();
    return expectedHeader === formHeaderText;
  }

  static async compareFieldCaption(captionFor: string, expectedCaption: string): Promise<boolean> {
    log.debug('Checking the field caption...');
    log.debug(`Caption For value: ${captionFor}, Expected caption: ${expectedCaption}`);

    log.debug(`Field caption with For value: ${captionFor} found`);
    const caption = await this.$fieldCaption(captionFor).getText();
    if (caption !== expectedCaption) {
      log.warn(`The found caption: "${caption}" for the field ${captionFor} does not match the specified caption "${expectedCaption}"`);
      return false;
    }

    log.debug(`Found caption "${caption}" matches the expected caption "${expectedCaption}"`);
    return true;
  }

  static async fill(formSchemaWithValues: any, timeout: number = browser.allScriptsTimeout) {
    for (let details of formSchemaWithValues) {
      await this.compareFieldCaption(details.ID, details.caption);

      details.$el = new WebuiElement($(`webuilib-item-job-form #${details.ID}`));
      switch (details.field) {
        case FormField.TEXTAREA:
        case FormField.INPUT:
        case FormField.AUTOCOMPLETE_INPUT:
          await details.$el.clear();
          await details.$el.sendKeys(details.value);
          break;
        case FormField.DATE:
          const $dateField = new WebuiElement(details.$el.$element.$('input'));
          const $datePickerBtn = new WebuiElement(details.$el.$element.$('.ui-datepicker-trigger'));
          await $dateField.clear();
          await $dateField.sendKeys(details.value);
          await $datePickerBtn.click();
          break;
        case FormField.AUTOCOMPLETE_DROPDOWN:
          // TODO: Select random data in autocomplete-dropdown
          const $autocompleteField = new WebuiElement(details.$el.$element.$('input.ui-dropdown-label'));
          await $autocompleteField.clear();
          await $autocompleteField.sendKeys(details.value);
          break;
        case FormField.DROPDOWN:
          // TODO Update script ref needs time to populate the field
          await browser.sleep(1200);
          const $dropdownDiv = new WebuiElement(details.$el.$element.$('.ui-dropdown'));
          const $dropdownClass = await $dropdownDiv.getAttribute('class');

          if ($dropdownClass.includes('ui-state-disabled')) {
            const elText = await $dropdownDiv.getText();
            details.value = elText;
            break;
          }

          await details.$el.click();
          const $$dropdownList = new WebuiElements($$('.ui-dropdown-item'));

          let $dropdownItem;
          if (details.value === 'random') {
            const randomIndex = _.random(1, await $$dropdownList.$$elements.count() - 1);
            $dropdownItem = new WebuiElement($$dropdownList.get(randomIndex));
            details.value = await $dropdownItem.getText();
          } else {
            $dropdownItem = await GetElementBy.cssWithExactText($$dropdownList.$$elements, details.value, timeout);
          }
          await $dropdownItem.click();
          break;  
      }
    }
    return formSchemaWithValues;
  }

  static async fillAndSubmitForm($buttonTrigger: WebuiElement | ElementFinder, formSchemaWithValues: Array<SchemaField>) {
    await $buttonTrigger.click();
    await FormPage.$formPanel.to.be.present();

    log.debug(`The form "${await FormPage.$formHeader.getText()}" has been displayed`);
    formSchemaWithValues = await FormPage.fill(formSchemaWithValues);
    
    const submitButton = await FormPage.$button('OK');
    await submitButton.click();

    await FormPage.$formPanel.to.be.stale();
    return formSchemaWithValues;
  }
}