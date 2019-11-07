import { browser } from 'protractor';
import * as _ from 'lodash';

import { SchemaField, ItemSummaryField, ItemConfig, GetElementBy, JSObject, JSONArray, ItemValueParameter } from '../helpers/helper.exports';
import { Application } from '../utils/utils.exports';

import { ToolbarPage, FormPage, ListPage, DetailsPage } from '../po/po.exports';

import { ItemSingularName, ItemPluralName } from '../../project/enum/generic.enum';
import { ReportingDB, WebuiElement } from './classes.exports';

const root = browser.params.root;
const fs = require('fs');

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
   * Initializes a log for the Item initialized with the class
   * 
   * @returns an object that creates logs
   */
  private get log(): any {
    return Application.log(`${this.name}`);
  }
  
  /**
   * Retrieves the schema of the item with defined values
   * 
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
   * Retrieves the instances of the item (not including collections) in the database
   * 
   * @param limit the maximum amount of instances to retrieve
   */
  async reportingDBInstances(conditions: any = `1 = 1`, limit: number = 0): Promise<JSObject | JSONArray> {
    return await ReportingDB.getItem(this.config.reportingDB.tableName, '*', conditions, null, limit);
  }

  /**
   * Executes the generic steps for creating an item which consists of:
   * ~~~
   * 1. Clicking the button for create
   * 2. Entering of data in the form
   * 3. Submitting the form
   * ~~~
   * Passes the data filled in the form to the item instance with the generated UUID
   * 
   * @param schemaName the schema name of the form to be filled
   * @param asCollection if true, the item will create itself as a collection
   */
  async create(asCollection: boolean = false): Promise<void> {
    this.instances['create'] = await FormPage.fillAndSubmitForm(
                                await ToolbarPage.$toolbarButton(this.config.toolbar.actions.create), 
                                this.formSchemaWithValues('create', 'create')
                              );
    this.instances['create'] = Object.assign(this.instances['create'], await this.addIDandUUIDtoItemInstance(this.instances['create']));
  }

  /**
   * Executes the generic steps for editing an item which consists of:
   * ~~~
   * 1. Clicking the button for edit
   * 2. Entering of data in the form
   * 3. Submitting the form
   * ~~~
   * Passes the data filled in the form to the item instance with the generated UUID
   * 
   * @param schemaName the schema name of the form to be filled
   * @param asCollection if true, the item will create itself as a collection
   */
  async edit(asCollection: boolean = false, mark: number | string = 0): Promise<void> {
    if (await ListPage.$listComponent.$element.isPresent()) {
      let $itemRow: WebuiElement = typeof mark === 'number' 
                        ? ListPage.$$tableRows.get(mark) 
                        : await GetElementBy.cssWithExactText(ListPage.$$tableRows.$$elements, mark);
      await $itemRow.$('.RadioButton span').click();
    }
    this.instances['edit'] = await FormPage.fillAndSubmitForm(await ToolbarPage.$toolbarButton(this.config.toolbar.actions.edit), this.formSchemaWithValues('edit', 'edit'));
    this.instances['edit'] = Object.assign(this.instances['edit'], await this.addIDandUUIDtoItemInstance(this.instances['edit']));
  }

  /**
   * Executes the generic steps for deleting an item which consists of:
   * ~~~
   * 1. Clicking the button for delete
   * 2. Confirming the deletion
   * ~~~
   * Passes the data filled in the form to the item instance with the generated UUID
   * 
   * @param asCollection if true, the item will delete itself as a collection
   */
  async delete(asCollection: boolean = false, mark: number | string = 0): Promise<void> {
    const identifier = this.config.reportingDB.identifier;
    this.instances['delete'] = {};

    if (await ListPage.$listComponent.$element.isPresent()) {
      let $itemRow: WebuiElement = typeof mark === 'number' 
      ? ListPage.$$tableRows.get(mark) 
      : await GetElementBy.cssWithExactText(ListPage.$$tableRows.$$elements, mark);
      await $itemRow.$('.RadioButton span').click();
      this.instances['delete'][identifier] = await $itemRow.$$('td').get(1).getText();
    } else {
      // Currently in the details page of the item, the identifier of the item is displayed at the header beside the item type
      await DetailsPage.$detailsHeader.to.have.text(this.name);
      this.instances['delete'][identifier] = (await DetailsPage.$detailsHeader.getText()).split(':')[1].trim();
    }

    await (await ToolbarPage.$toolbarButton(this.config.toolbar.actions.delete)).click();
    await ToolbarPage.closeDialog('Yes');
  }

  async addIDandUUIDtoItemInstance(itemInstance: JSObject) {
    const identifier = this.config.reportingDB.identifier;
    const conditions = await ReportingDB.parseToQueryConditions(itemInstance, this.config.summary, ItemSummaryField.SCHEMA_ID, this.config.reportingDB);
    const itemDBRow = await ReportingDB.getItem(this.config.reportingDB.tableName, ['UUID', identifier] , conditions);
    itemInstance.UUID = itemDBRow['UUID'];
    itemInstance[identifier] = itemDBRow[identifier];
    return itemInstance;
  }
}