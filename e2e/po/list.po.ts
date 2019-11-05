import { $, $$ } from 'protractor';
import { WebuiElement, WebuiElements } from '../classes/classes.exports';
import { GetElementBy, JSONArray } from '../helpers/helper.exports';
import { Application } from '../utils/utils.exports';

const log = Application.log('List Page');

export enum ListPageElement {
  LIST_SELECTOR = 'cristalise-list',
  LOADING_ICON = 'cristalise-list ui-table-loading',
  HEADER = 'cristalise-list p-table thead tr.itemCollectionRow th',
  ROWS = 'cristalise-list p-table tbody tr'
}
export class ListPage {
  static get $listComponent(): WebuiElement {
    return new WebuiElement($(ListPageElement.LIST_SELECTOR));
  }

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

  static async verifyColumns(expectedTableColumns: JSONArray): Promise<void> {
    let currentTableColumns = (<any> await ListPage.$$columnHeaders.getText()).filter(header => header);

    for (const column of expectedTableColumns) {
      const headerText = await (await ListPage.$columnHeader(column)).getText().catch(error => {
        const errorMsg = error.includes(`No element found that contains the text: ${column}`) 
                      ? `The column "${column}" for the table does not exist` : error;
        log.error(errorMsg);
        throw error;
      });
  
      log.debug(`Column: ${column} is present`);
      currentTableColumns = currentTableColumns.filter(header => header !== headerText);
    }
  
    if (currentTableColumns.length > 0) {
      const errorMsg = `The column/s [${currentTableColumns.join(',')}] exists in the list, but is/were not defined in the Item Configuration. Unsafe to continue.`;
      log.error(errorMsg);
      throw errorMsg;
    }
  
    log.debug(`No missing or extra columns`);
  }
}