import { by, element } from 'protractor';
import { WebuiElement } from '../classes/classes.exports';
import { GetElementBy } from '../helpers/helper.exports';

export enum ListPageElement {
  LIST_HEADER = 'cristalise-list p-table thead tr.itemCollectionRow th',
}
export class ListPage {
    static _columnHeader(caption: string): Promise<WebuiElement> {
      // For some reason, header captions are enclosed with spaces
      return GetElementBy.cssWithExactText(element.all(by.css(ListPageElement.LIST_HEADER)), ` ${caption} `);
    }

    static get _columnHeaders() {
      return element.all(by.css(ListPageElement.LIST_HEADER));
    }
}