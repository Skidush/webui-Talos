import { $, $$ } from 'protractor';
import { WebuiElement, WebuiElements } from '../classes/classes.exports';
import { GetElementBy } from '../helpers/helper.exports';

export enum ListPageElement {
  LOADING_ICON = 'cristalise-list ui-table-loading',
  HEADER = 'cristalise-list p-table thead tr.itemCollectionRow th',
  ROWS = 'cristalise-list p-table tbody tr'
}
export class ListPage {
  static get $loadingIcon(): WebuiElement {
    return new WebuiElement($(ListPageElement.LOADING_ICON));
  }

  static $columnHeader(caption: string): Promise<WebuiElement> {
    // Header captions are enclosed with spaces
    return GetElementBy.cssWithExactText($$(ListPageElement.HEADER), ` ${caption} `);
  }

  static get $$columnHeaders(): WebuiElements {
    return new WebuiElements($$(ListPageElement.HEADER));
  }

  static get $$tableRows(): WebuiElements {
    return new WebuiElements($$(ListPageElement.ROWS));
  }
}