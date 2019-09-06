import { browser } from 'protractor';
import * as _ from 'lodash';

import { ToolbarPage, FormPage } from '../po/po.exports';
import { TestValue, TestValueParam, ItemNameSingular, ItemNamePlural } from '../helpers/enum/test.enum';
import { ItemSummary, ItemSummaryField, ItemConfig, Table, Details } from '../helpers/interfaces/item.interface';
import { ElementToBe, ReportingDB } from '../helpers/helper.exports';
import { Application } from '../utils/utils.exports';

const root = browser.params.testsPath;
const fs = require('fs');

export class Item implements ItemConfig {
  readonly config: ItemConfig;
  readonly reportingDBConfig: any;
  readonly toolbarConfig: any;
  readonly tableConfig: Table;
  readonly detailsConfig: Details;
  
  readonly identifier: string;

  readonly summary: Array<ItemSummary>;
  readonly schema: any;
  
  readonly name: ItemNameSingular;
  readonly pluralName: ItemNamePlural;
  readonly values: any;
  readonly url: string

  readonly rdbTableName: string;
  readonly rdbForeignKeys: string;

  constructor(itemName: ItemNameSingular) {
    this.name = itemName;
    this.pluralName = ItemNamePlural[itemName];
    
    this.values = this.getValues;

    this.config = this.getConfig;
    this.toolbarConfig = this.config.toolbarConfig;
    this.detailsConfig = this.config.detailsConfig;
    this.summary = this.config.summary;
    this.schema = this.config.schema;
    this.reportingDBConfig = this.config.reportingDBConfig;
    this.url = this.config.url;
    this.identifier = this.config.identifier;

    this.rdbTableName = this.reportingDBConfig.tableName;
    this.rdbForeignKeys = this.reportingDBConfig.foreignKeys;
  }

  /**
   * Initializes the log for Item class
   * @returns an stdin and stdout log
   */
  private get log(): any {
    return Application.log(`Item(${this.name})`);
  }

  /**
   * Retrieves the whole configuration of the item
   * @returns the configuration of the item in JSON
   */  
  private get getConfig(): any {
    const path = `${root}/data/${this.name}/itemConfiguration.json`;
    this.log.debug(`Config retrieved from: ${path}`);

    const config = JSON.parse(fs.readFileSync(path))
    this.log.debug(`Config: ${config}`);

    return config;
  }

  /**
   * Retrieves the values of the item.
   * @returns the values of the item in JSON
   */  
  get getValues() {
    const path = `${root}/data/${this.name}/values.td.json`;
    this.log.debug(`Test data values retrieved from: ${path}`);
    
    const testData = JSON.parse(fs.readFileSync(path));
    this.log.debug(`Test data: ${JSON.stringify(testData)}`);

    return testData;
  }

  /**
   * Retrieves the toolbar configuration of the item
   * @returns the configuration of the item toolbar in JSON
   */  
  get getToolbarConfig(): any {
    const toolbars = JSON.parse(this.toolbarConfig);
    this.log.debug(`Toolbars: ${toolbars}`);

    return toolbars;
  }
  
  /**
   * Retrieves the schema of the item with defined values
   * @param valueType the type of values to pair fill the schema with. See the `TestValue` enum for more details.
   * @returns the schema of the item with defined values in JSON
   */
  formSchemaWithValues(valueType: TestValue, schemaName: string) {
    const itemValues = this.values[valueType];
    const formSchema = _.cloneDeep(this.schema[schemaName]);

    this.log.debug(`Populating schema with values`);
    try {
      for (let formField of formSchema) {
        const value = Object.keys(itemValues).find(keys => keys.toUpperCase() === formField.ID.toUpperCase());
  
        if (itemValues[value].includes(TestValueParam.RANDOM_NUM)) {
          this.log.debug(`Replacing value param from: ${itemValues[value]}`);
          itemValues[value] = itemValues[value].replace(TestValueParam.RANDOM_NUM, _.random(0, 9999));
          this.log.debug(`New value: ${itemValues[value]}`);
        }
        formField['value'] = itemValues[value];
        this.log.debug(`${formField.ID}: ${formField['value']}`);
      }
    } catch (_err) {
      if (_err instanceof TypeError && _err.message.includes(`Cannot read property 'length' of undefined`)) {
        throw `The schema "${schemaName}" of item "${this.name}" is not defined`;
      }
    }

    this.log.debug(`Form schema with values: ${JSON.stringify(formSchema)}`);
    return formSchema;
  }

  /**
   * Executes the generic steps for creating an item which consists of:
   * 1. Clicking the button for create
   * 2. Entering of data in the form
   * 3. Submitting the form
   * 
   * Passes the data filled in the form to the protractor browser params: createdItemDetails
   * Passes the UUID of the entered data to the protractor browser params: createdUUIDs
   */
  async create() {
    this.log.info(`Creating a/an ${this.name}`);
    let formSchemaWithValues;

    try {
      formSchemaWithValues = this.formSchemaWithValues(TestValue.CREATE, 'create|edit');
    } catch (_err) {
      formSchemaWithValues = this.formSchemaWithValues(TestValue.CREATE, 'create');
    }
        
    const createButton = await ToolbarPage.findButton(this.toolbarConfig.actions.create);
    await createButton.click();
    const formPanel = await FormPage._formPanel;
    this.log.info(`The form "${await (await FormPage._formHeader).getText()}" has been displayed`);
    
    formSchemaWithValues = await FormPage.fill(formSchemaWithValues);
    const createdItemValues = this.values[TestValue.CREATE];

    const submitButton = await FormPage._button('OK');
    await submitButton.click();

    await ElementToBe.stale(formPanel.nativeElement);

    const conditions = await ReportingDB.parseToQueryConditions(createdItemValues, this.summary, ItemSummaryField.SCHEMA_ID);
    const itemDBRow = await (await ReportingDB.getItem(this.rdbTableName, ['UUID', this.identifier.toUpperCase()] , conditions));

    createdItemValues.UUID = itemDBRow.UUID;
    createdItemValues[_.camelCase(this.identifier)] = itemDBRow[this.identifier.toUpperCase()];

    browser.params.createdItemDetails[this.name] = createdItemValues;
  }

  // /**
  //  * Retrieves the item list columns of the item
  //  *
  //  * @param itemSummary the summary configuration of the item
  //  * 
  //  * @returns the item list columns of the item in JSON
  //  */  
  // static getColumns(itemSummary: Array<any>): Array<string> {
  //   return itemSummary.map(res => res.tableColumn).filter(col => !isNullOrUndefined(col));
  // }

  // static async parseRDBData(rdbListData: any, rdbConfig?: any) {
  //   const parsedItemData = [];
  //   for (const item of rdbListData) {
  //     let rowData;
  //     for (const key in item) {
  //       // Some items save 'null' as a string in the database
  //       if (isNullOrUndefined(item[key]) || item[key] === 'null') {
  //         continue;
  //       }
        
  //       if (rdbConfig && rdbConfig.hasOwnProperty('foreignKeys')) {
  //         const fkey = rdbConfig.foreignKeys;
  //         if (fkey.hasOwnProperty(key)) {
  //           let res;
  //           if (fkey[key].constructor.name === 'String') {
  //             res = await ReportingDB.getItem(fkey[key], `"UUID" = '${item[key]}'`, "NAME");
  //           } else if (fkey[key].constructor.name === 'Object') {
  //             res = await ReportingDB.getItem(fkey[key]['table'], `"UUID" = '${item[key]}'`, "NAME");
  //           }
  //           item[key] = res.NAME;
  //         }
  //       }

  //       if (item[key] instanceof Date) {
  //         item[key] = this.parseISODate(item[key]);
  //       }

  //       rowData = rowData ? `${rowData} ${item[key]}` : item[key];
  //     }
  //     rowData = rowData.replace(/\s\s+/g, ' ');
  //     parsedItemData.push(rowData);
  //   }
  //   return parsedItemData;
  // }

  // static parseISODate(date: Date) {
  //   const dateRegex = /(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})\.(\d{3}[Z])/gm;
  //   const timeRegex = /(\d[16])\:(\d[00])\:(\d[00])/gm;
  //   if (dateRegex.test(date.toISOString())) {
  //     let isoDate = new Date(date.toISOString());
  //     isoDate.setDate(isoDate.getDate() + 1);
  //     (isoDate as any) = (isoDate.toISOString()).split("T");

  //     // TODO Create wrappers for date time
  //     // Some times are being shown as datetime with seconds and some are being shown without the seconds.

  //     // let time = isoDate[1]
      
  //     // if (!timeRegex.test(time)) {
  //     //   time = time.split('.')
  //     // }

  //     return isoDate[0];
  //   } 

  //   // Default
  //   return date;
  // }
}