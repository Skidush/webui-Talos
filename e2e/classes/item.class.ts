import { browser, promise } from 'protractor';
import * as _ from 'lodash';

import { ItemValueParameter } from '../helpers/enum/generic.enum';
import { JSONObject, JSONArray } from '../helpers/interfaces/generic.interface';
import { ElementToBe, SchemaField, Details, ItemSummary, ItemSummaryField, ItemConfig, Table } from '../helpers/helper.exports';
import { Application } from '../utils/utils.exports';

import { ToolbarPage, FormPage } from '../po/po.exports';

import { ItemSingularName, ItemPluralName } from '../../project/enum/generic.enum';
import { ReportingDB } from './classes.exports';

const root = browser.params.root;
const fs = require('fs');

// TODO custom errors
// Maybe also do an item name search on files??
export class Item implements ItemConfig {
  readonly config: ItemConfig;
  readonly reportingDB: any;
  readonly toolbar: any;
  readonly table: Table;
  readonly details: Details;
  
  readonly identifier: string;

  readonly summary: Array<ItemSummary>;
  readonly schema: any;
  
  readonly name: ItemSingularName;
  readonly pluralName: ItemPluralName;
  readonly values: any;
  readonly url: string

  constructor(itemName: ItemSingularName | ItemPluralName) {
    // Means the itemName is singular
    this.name = ItemSingularName[itemName.toUpperCase()];
    this.pluralName = ItemPluralName[itemName.toUpperCase()];

    // If the itemName is plural
    if (!this.name) {
      this.name = <ItemSingularName> Object.keys(ItemPluralName).find(name => {
        if (ItemPluralName[name] === itemName) {
          return name;
        }
      });
      this.pluralName = ItemPluralName[this.name.toUpperCase()];
    }
    
    this.values = this._values;

    this.config = this._config;
    this.toolbar = this.config.toolbar;
    this.details = this.config.details;
    this.summary = this.config.summary;
    this.schema = this.config.schema;
    this.reportingDB = this.config.reportingDB;
    this.url = this.config.url;
    this.identifier = this.config.identifier;
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
  private get _config(): ItemConfig {
    const path = `${root}/project/data/${this.name}/itemConfiguration.json`;
    const config = JSON.parse(fs.readFileSync(path))
    this.log.debug(`Config retrieved from: ${path}`);
    this.log.debug(`Config: ${JSON.stringify(config)}`);

    return config;
  }

  /**
   * Retrieves the values of the item.
   * @returns the values of the item in JSON
   */  
  get _values(): any {
    const path = `${root}/project/data/${this.name}/values.td.json`;
    const testData = JSON.parse(fs.readFileSync(path));
    this.log.debug(`Test data values retrieved from: ${path}`);
    this.log.debug(`Test data: ${JSON.stringify(testData)}`);

    return testData;
  }
  
  /**
   * Retrieves the schema of the item with defined values
   * @param valueType the values to pair with the schema. See `values.td.json` of an item
   * @returns the schema of the item with defined values in JSON
   */
  formSchemaWithValues(valueType: any, schemaName: string): Array<SchemaField> {
    const itemValues = this.values[valueType];
    const formSchema = _.cloneDeep(this.schema[schemaName]);

    this.log.debug(`Populating schema with values`);
    try {
      for (let formField of formSchema) {
        const value = Object.keys(itemValues).find(keys => keys.toUpperCase() === formField.ID.toUpperCase());
  
        if (itemValues[value].includes(ItemValueParameter.RANDOM_NUM)) {
          this.log.debug(`Replacing value param from: ${itemValues[value]}`);
          itemValues[value] = itemValues[value].replace(ItemValueParameter.RANDOM_NUM, _.random(0, 9999));
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
   * Retrieves the instances of the item (not including collections) in the database.
   * @param limit the maximum amount of instances to retrieve
   */
  async reportingDBInstances(conditions: any = `1 = 1`, limit: number = 0): Promise<JSONObject | JSONArray> {
    return await ReportingDB.getItem(this.reportingDB.tableName, '*', conditions, limit);
  }

  /**
   * Navigates to the dedicated page of the item
   * @returns a command to either navigate to the given page or refresh the page
   */
  async navigateToPage(): promise.Promise<any> {
    const itemUrl = `${browser.baseUrl}/${this.url}`;
    this.log.debug(`Navigating to ${itemUrl}`);

    return (await browser.getCurrentUrl()) !== itemUrl ? browser.get(itemUrl) : browser.refresh();
  }

  /**
   * Executes the generic steps for creating an item which consists of:
   * 1. Clicking the button for create
   * 2. Entering of data in the form
   * 3. Submitting the form
   * 
   * Passes the data filled in the form to the protractor browser params: createdItemDetails
   * Passes the UUID of the created data to the protractor browser params: createdUUIDs
   * 
   * @param asCollection if true, the item will create itself as a collection
   */
  async create(asCollection: boolean = false) {
    this.log.debug(`Creating a/an ${this.name}`);
    //TODO create iteself as a collection
    const valueType = 'create';
    let formSchemaWithValues;

    try {
      formSchemaWithValues = this.formSchemaWithValues(valueType, 'create|edit');
    } catch (_err) {
      formSchemaWithValues = this.formSchemaWithValues(valueType, 'create');
    }
        
    const createButton = await ToolbarPage.findButton(this.toolbar.actions.create);
    await createButton.click();
    const formPanel = await FormPage._formPanel;
    this.log.debug(`The form "${await (await FormPage._formHeader).getText()}" has been displayed`);
    
    formSchemaWithValues = await FormPage.fill(formSchemaWithValues);
    const createdItemValues = this.values[valueType];

    const submitButton = await FormPage._button('OK');
    await submitButton.click();

    await ElementToBe.stale(formPanel.nativeElement);

    const conditions = await ReportingDB.parseToQueryConditions(createdItemValues, this.summary, ItemSummaryField.SCHEMA_ID);
    const itemDBRow = await (await ReportingDB.getItem(this.reportingDB.tableName, ['UUID', this.identifier.toUpperCase()] , conditions));

    createdItemValues.UUID = itemDBRow['UUID'];
    createdItemValues[_.camelCase(this.identifier)] = itemDBRow[this.identifier.toUpperCase()];

    browser.params.createdItemDetails[this.name] = createdItemValues;
  }

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