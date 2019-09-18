import { by, element } from 'protractor';
import { WebuiElement, WebuiElements } from '../classes/classes.exports';
import { GetElementBy } from '../helpers/helper.exports';

export enum ListPageElement {
  LOADING_ICON = 'cristalise-list ui-table-loading',
  HEADER = 'cristalise-list p-table thead tr.itemCollectionRow th',
  ROWS = 'cristalise-list p-table tbody tr'
}
export class ListPage {
  static get _loadingIcon(): Promise<WebuiElement> {
    return GetElementBy.elementFinder(element(by.css(ListPageElement.LOADING_ICON)));
  }

  static _columnHeader(caption: string): Promise<WebuiElement> {
    // For some reason, header captions are enclosed with spaces
    return GetElementBy.cssWithExactText(element.all(by.css(ListPageElement.HEADER)), ` ${caption} `);
  }

  static get _columnHeaders(): Promise<WebuiElements> {
    return GetElementBy.elementsFinder(element.all(by.css(ListPageElement.HEADER)));
  }

  static get _tableRows(): Promise<WebuiElements> {
    return GetElementBy.elementsFinder(element.all(by.css(ListPageElement.ROWS)));
  }
}