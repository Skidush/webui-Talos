import { Given, When, Then, defineStep } from 'cucumber';
import { browser } from 'protractor';
import { isNullOrUndefined } from 'util';
import * as _ from 'lodash';

import { ReportingDB, Item, Step, FieldFormat } from '../classes/classes.exports';
import { ItemActivity, ItemSummaryField, Page } from '../helpers/helper.exports';
import { Application } from '../utils/utils.exports';

import { DetailsPage, ListPage, ToolbarPage } from '../po/po.exports';
import { ParamaterUtil } from '../features/support/parameterTypes';

const chai = require('chai').use(require('chai-as-promised'));
const expect = chai.expect;
const log = Application.log(browser.params.currentScenario);

defineStep(Step.navigateToItemPage, async function (instance, page) {
  let path = `${browser.baseUrl}/${Page[page.toUpperCase()]}`;
  const currentUrl = await browser.getCurrentUrl();

  log.info(`Step: The user is on the ${page} page`);
  log.info(`Navigating to ${path}`);
  if (instance) {
    const item: Item = ParamaterUtil.getItemObject(page);
    const lastInstance = ([...browser.params.initializedItems].pop()).instances[instance];
    path = `${path}/${encodeURI(lastInstance[0][item.config.reportingDB.identifier])}`;
  }
  await browser.get(path);

  const isRedirected = await Application.isRedirected(currentUrl, path);
  if (!isRedirected) {
    const error = `The browser was not redirected to: ${path}`;
    log.debug(`Current url: ${currentUrl}`);
    log.error(error);
    throw error;
  }
});

Given('A/An {itemState} {item} exists', async function (state, item) {
  log.info(`Step: A/An ${state} ${item.name} exists`);
  item.instances[state] = await item.reportingDBInstances({STATE: state}, 1);
  log.debug(`${item.name} with state '${state}': ${JSON.stringify(item.instances[state])} exists`);
});

When('The user {itemActivity}(s) a/an/the {item}', async function (action, item) {
  log.info(`Step: The user ${action}(s) a/an ${item.name}`);

    switch (action) {
      case ItemActivity.CREATE:
        await item.create();
        break;
      case ItemActivity.EDIT:
        await item.edit();
        break;
      case ItemActivity.DELETE:
        await item.delete();
        break;
    }
});

Then('The user should be redirected to the details page of the {itemActivity}(d)(ed) {item}', async function (activity, item) {
  log.info(`Step: The user should be redirected to the details page of the item: ${item.name}`);
  const itemUrl = `${browser.baseUrl}/${item.config.url.substring(0, item.config.url.lastIndexOf('/'))}` +
                  `/${encodeURI(item.instances[activity][item.config.reportingDB.identifier])}`;
  expect(await browser.getCurrentUrl(), `The browser was not redirected to the details page of the item: ${item.name}`).to.equal(itemUrl);
  log.info('Redirection checked');
});

Then('The user should be not be able to execute further actions on the {item}', async function (item) {
  log.info(`Step: The user should be not be able to execute further actions on the: ${item.name}`);
  let extraToolbarFound = false;

  // No other toolbars should be shown except for 'New'
  for (const toolbar of item.config.toolbar.toolbars) {
    if (toolbar === 'New') {
      continue;
    }

    await (await ToolbarPage.$toolbarButton(toolbar)).to.be.stale().catch((error: Error) => {
      extraToolbarFound = toolbar;
    });
  }

  expect(!!extraToolbarFound, `${extraToolbarFound} is still displayed`).to.be.false;
});

Then('The user should be redirected to the {page} page', async function (page) {
  log.info(`Step: The user should be redirected to the ${page} page`);

  const nextPage = `${browser.baseUrl}/${Page[page.toUpperCase()]}`;
  const currentPage = await browser.getCurrentUrl(); // THIS
  log.debug(`Current page: ${currentPage}`);
  log.debug(`Next page: ${nextPage}`);

  const isRedirected = await Application.isRedirected(`${currentPage}`, `${nextPage}`);
  log.debug(`Browser was redirected: ${isRedirected}`);
  
  expect(isRedirected).to.be.true;
  log.info('Redirection checked');
});

Then(Step.viewItemDetails, async function(action, tenseSuffix, state, item) {
  item = ParamaterUtil.getItemObject(item);
  const detailsConfig  = item.config.details;
  const itemSummaryConfig = item.config.summary;
  const rdbConfig = item.config.reportingDB;
  
  log.info(`Step: The user should see the ${action}(d)(ed) item details of the ${item.name}`);
  const displayedDetails = {};
  for (let key in detailsConfig) {
    const details = detailsConfig[key];
    if (details.type === 'TABLE') {
      continue;
    }

    const text = await DetailsPage.$detailField(key).getText();
    if (text) {
      displayedDetails[_.startCase(key)] = text;
    }    
  }
  log.debug(`Data displayed in item details: ${JSON.stringify(displayedDetails)}`);

  const detailsDBCols = itemSummaryConfig.map(summary => {
    if (!isNullOrUndefined(summary.detailsID) && !isNullOrUndefined(summary.DBColumn)) {
      return summary.DBColumn;
    }
  }).filter(summary => summary);

  const conditions = state ? item.instances[state] : item.instances[action];
  const condition = await ReportingDB.parseToQueryConditions(conditions, itemSummaryConfig, ItemSummaryField.DETAILS_ID, rdbConfig);
  const rdbItemRow = await ReportingDB.getItem(rdbConfig.tableName, detailsDBCols, condition);
  for (const key in rdbItemRow) {
    const summary = (itemSummaryConfig).find(summary => summary.DBColumn === key);
    const scKey = _.startCase(summary.detailsID);

    if (isNullOrUndefined(rdbItemRow[key]) || !displayedDetails.hasOwnProperty(scKey)) {
      delete rdbItemRow[key];
      continue;
    }

    const fk = rdbConfig.foreignKeys[key];
    const value = rdbItemRow[key];
    delete rdbItemRow[key];
    rdbItemRow[scKey] = value;
    if (fk) {
      // TODO : Base the columns on the respective identifiers
      rdbItemRow[scKey] = (await ReportingDB.getItem(fk.table, "NAME", { UUID: value }))["NAME"];
    }

    const fieldWithFormat = conditions.find(field => field.ID === summary.schemaID && field.format);
    if (fieldWithFormat) {
      rdbItemRow[scKey] = FieldFormat.formatFieldValue(fieldWithFormat.format, rdbItemRow[scKey]);
    }
  }

  expect(displayedDetails, `The displayed details of the created ${item.name} does not match the database records`).to.eql(rdbItemRow);
  log.info(`${item.name} details checked`);
});

Then(Step.viewItemsInList, async function (view, action, tenseSuffix, item) {
  item = ParamaterUtil.getItemObject(item);
  log.info(`Step: The user should see details of ${item.name}/${item.pluralName} in the table`);
  await ListPage.$loadingIcon.to.be.stale();
  
  const itemTableColumns = item.config.table.columns.map(columns => columns.column);
  await ListPage.verifyColumns(itemTableColumns);

  const tableRDBColumns = item.config.summary.map(summaryRow => summaryRow.DBColumn).filter(dbColumn => (itemTableColumns.map(column => column.toUpperCase()).includes(dbColumn)));
  let conditions = item.config.table.filters;
  if (action) {
    const rowID = item.instances[action][item.config.reportingDB.identifier];
    await ToolbarPage.$searchInput.sendKeys(rowID);
    await ListPage.$loadingIcon.to.be.stale();
    conditions = {};
    conditions[item.config.reportingDB.identifier] = rowID;
    await browser.sleep(2500); // TODO: TOFIX. Loading disappears even when the list has not yet completely loaded
  }

  const expectedData = await ListPage.$$tableRows.getText();

  let originalData = await ReportingDB.getItem(item.config.reportingDB.tableName, tableRDBColumns, conditions, item.config.table.orderBy, item.config.table.maxRows);
  originalData.forEach(row => {
    Object.keys(row).forEach(column => {
      return row[column] == null && delete row[column];
    });
  });
  originalData = originalData.map(row => Object.values(row).join(' '));

  expect(expectedData, `Details found in the table does not match the ones retrieved from the database`).to.eql(originalData);
  log.info(`${item.name} details in the table has been checked`);
});