import { browser } from 'protractor';
import * as _ from 'lodash';

import { ItemValueParameter } from '../helpers/enum/testGeneric.enum';
import { JSONObject, JSONArray } from '../helpers/interfaces/generic.interface';
import { SchemaField, ItemSummaryField, ItemConfig } from '../helpers/helper.exports';
import { Application } from '../utils/utils.exports';

import { ToolbarPage, FormPage, ListPage } from '../po/po.exports';

import { ItemSingularName, ItemPluralName } from '../../project/enum/generic.enum'; // TO FIX
import { ReportingDB } from './classes.exports';

const root = browser.params.root;
const fs = require('fs');

// TODO custom errors
// Maybe also do an item name search on files??
// Implements an Item interface
export class Item {
  readonly name: ItemSingularName;
  readonly pluralName: ItemPluralName;
  
  readonly config: ItemConfig;
  readonly values: any;

  instances: JSON;
  constructor(itemName: ItemSingularName | ItemPluralName) {
    this.name = ItemSingularName[itemName.toUpperCase()];
    this.pluralName = ItemPluralName[itemName.toUpperCase()];

    if (!this.name) {
      this.name = <ItemSingularName> Object.keys(ItemPluralName).find(name => {
        if (ItemPluralName[name] === itemName) {
          return _.startCase(_.toLower(name));
        }
      });
      this.pluralName = ItemPluralName[this.name.toUpperCase()];
    }
    
    this.config = JSON.parse(fs.readFileSync(`${root}/project/data/${this.name}/itemConfiguration.json`));
    this.values = JSON.parse(fs.readFileSync(`${root}/project/data/${this.name}/values.td.json`));
    this.instances = JSON;
  }

  /**
   * Initializes the log for Item class
   * @returns an object that creates logs
   */
  private get log(): any {
    return Application.log(`Item(${this.name})`);
  }
  
  /**
   * Retrieves the schema of the item with defined values
   * @param valueType the values to pair with the schema. See `values.td.json` of an item
   * @returns the schema of the item with defined values in JSON
   */
  formSchemaWithValues(valueType: any, schemaName: string): Array<SchemaField> {
    try {
      const itemValues = this.values[valueType];
      let formSchema = _.cloneDeep(this.config.schema[schemaName]);
      if (!formSchema && (schemaName === 'create' || schemaName === 'edit')) {
        formSchema = _.cloneDeep(this.config.schema['create|edit']);
      }

      this.log.debug(`Populating schema with values`);
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

      this.log.debug(`Form schema with values: ${JSON.stringify(formSchema)}`);
      return formSchema;
    } catch (_err) {
      if (_err instanceof TypeError && _err.message.includes(`Cannot read property 'length' of undefined`)) {
        throw `The schema "${schemaName}" of item "${this.name}" is not defined`;
      }
    }
  }

  /**
   * Retrieves the instances of the item (not including collections) in the database.
   * @param limit the maximum amount of instances to retrieve
   */
  async reportingDBInstances(conditions: any = `1 = 1`, limit: number = 0): Promise<JSONObject | JSONArray> {
    return await ReportingDB.getItem(this.config.reportingDB.tableName, '*', conditions, null, limit);
  }

  /**
   * Executes the generic steps for creating/editing an item which consists of:
   * 1. Clicking the button for create
   * 2. Entering of data in the form
   * 3. Submitting the form
   * 
   * Passes the data filled in the form to the item instance with the generated UUID
   * 
   * @param schemaName the schema name of the form to be filled
   * @param asCollection if true, the item will create itself as a collection
   */
  async create(asCollection: boolean = false) {
    this.log.debug(`Creating a/an ${this.name}`);
    //TODO create iteself as a collection
    const valueType = 'create';
    let formSchemaWithValues = this.formSchemaWithValues(valueType, 'create');
    
    // TODO Reduce to a declarative method
    // ==========
    (await ToolbarPage.$toolbarButton(this.config.toolbar.actions.create)).click();
    await FormPage.$formPanel.to.be.present();
    this.log.debug(`The form "${await FormPage.$formHeader.getText()}" has been displayed`);
    
    formSchemaWithValues = await FormPage.fill(formSchemaWithValues);
    this.instances['created'] = this.values[valueType]; // hmmmm what? should be form schema with values... lets see

    const submitButton = await FormPage.$button('OK');
    await submitButton.click();

    await FormPage.$formPanel.to.be.stale();
    // ==========

    const conditions = await ReportingDB.parseToQueryConditions(this.instances['created'], this.config.summary, ItemSummaryField.SCHEMA_ID);
    const itemDBRow = await (await ReportingDB.getItem(this.config.reportingDB.tableName, ['UUID', this.config.identifier.toUpperCase()] , conditions));

    this.instances['created'].UUID = itemDBRow['UUID'];
    this.instances['created'][_.camelCase(this.config.identifier)] = itemDBRow[this.config.identifier.toUpperCase()];

    browser.params.createdItemDetails[this.name] = this.instances['created']; // ???
  }

  // async edit(fromItemPage: boolean = false, asCollection: boolean = false) {
  //   this.log.debug(`Editing a/an ${this.name}`);
  //   //TODO edit iteself as a collection
  //   const valueType = 'edit';
  //   let formSchemaWithValues;
  //   try {
  //     formSchemaWithValues = this.formSchemaWithValues(valueType, 'create|edit');
  //   } catch (_err) {
  //     formSchemaWithValues = this.formSchemaWithValues(valueType, valueType);
  //   }
        
  //   if (fromItemPage) {
  //     const editButton = await ToolbarPage.findButton(this.config.toolbar.actions.edit);
  //     await editButton.click();
  //   } else {
  //     const firstItemInList = await (await ListPage._tableRows).first();
  //     if (this.config.table.tableSelector === 'RadioButton') {
  //       // await firstItemInList._element.element(by.css)
  //     }
  //   }
  //   const formPanel = await FormPage._formPanel;
  //   this.log.debug(`The form "${await (await FormPage._formHeader).getText()}" has been displayed`);
    
  //   formSchemaWithValues = await FormPage.fill(formSchemaWithValues);
  //   const createdItemValues = this.values[valueType];

  //   const submitButton = await FormPage._button('OK');
  //   await submitButton.click();

  //   await ElementToBe.stale(formPanel._element);

  //   const conditions = await ReportingDB.parseToQueryConditions(createdItemValues, this.config.summary, ItemSummaryField.SCHEMA_ID);
  //   const itemDBRow = await (await ReportingDB.getItem(this.config.reportingDB.tableName, ['UUID', this.config.identifier.toUpperCase()] , conditions));

  //   createdItemValues.UUID = itemDBRow['UUID'];
  //   createdItemValues[_.camelCase(this.config.identifier)] = itemDBRow[this.config.identifier.toUpperCase()];

  //   browser.params.createdItemDetails[this.name] = createdItemValues;
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