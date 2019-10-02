import { Given, When, Then, defineStep } from 'cucumber';
import { browser } from 'protractor';
import { isNullOrUndefined } from 'util';
import * as _ from 'lodash';

import { ReportingDB } from '../classes/classes.exports';
import { ItemActivity, ItemSummaryField, Page } from '../helpers/helper.exports';
import { Application } from '../utils/utils.exports';

import { DetailsPage, ListPage, LoginPage } from '../po/po.exports';
import { ParamaterUtil } from '../features/support/parameterTypes';

const chai = require('chai').use(require('chai-as-promised'));
const expect = chai.expect;
const log = Application.log(browser.params.currentScenario);

/**
 * Expression:
 * ================================================================
 * The user (is on/navigates to) the ({instance}) {page} page
 * ================================================================
 * Usage:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * The user is on the {page}
 * The user navigates to the {page}
 * The user navigates to the ({instance}) {page}
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Examples:
 * ----------------------------------------------------------------
 * The user is on the Capabilities page
 * The user navigates to the Capabilities page
 * The user navigates to the existing Capabilities page
 * ----------------------------------------------------------------
 * Description:
 * ================================================================
 * Navigates to the instance or the page of the item.
 * ================================================================
 */
defineStep(new RegExp(`^The user (?:is on|navigates to) the((?:\\s)existing|selected)? (${ParamaterUtil.toOrFormat(Page, true, false)}) page$`), async function (instance, page) {
  const path = `${browser.baseUrl}/${Page[page.toUpperCase()]}`;
  const currentUrl = await browser.getCurrentUrl();

  log.info(`=================== [STEP: The user is on the ${page} page]`);
  log.info(`Navigating to ${path}`);
  if (instance) {
    const lastInstance = ([...browser.params.initializedItems].pop()).instances.existing;
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
  log.info(`=================== [STEP: A/An ${state} ${item.name} exists]`);
  item.instances['existing'] = await (await item.reportingDBInstances({STATE: state}, 1));
  log.info(`A record for a/an ${state} ${item.name} exists`);
  log.debug(`Existing ${state} ${item.name}: ${JSON.stringify(item.instances['existing'])} `);
});

When('The user {itemActivity}(s) a/an {item}', async function (action, item) {
  log.info(`=================== [STEP: The user ${action}(s) a/an ${item.name}]`);

    switch (action) {
      case ItemActivity.CREATE:
        await item.create();
        break;
      case ItemActivity.EDIT:
        await item.edit();
        break;
      // case 'delete':
      //   await Item.delete(itemName);
      //   break;
    }
});

Then('The user should be redirected to the details page of the created {item}', async function (item) {
  log.info(`=================== [STEP: The user should be redirected to the details page of the created ${item.name}]`);
  const itemUrl = `${browser.baseUrl}/${item.config.url.substring(0, item.config.url.lastIndexOf('/'))}` +
                  `/${encodeURI(browser.params.createdItemDetails[item.name][_.camelCase(item.config.identifier)])}`;

  expect(await browser.getCurrentUrl(), `The browser was not redirected to the details page of the created ${item.name}`).to.equal(itemUrl);
  log.info('Redirection checked');
});

//TODO TOFIX
Then('The user should be redirected to the {page} page', async function (page) {
  log.info(`=================== [STEP: The user should be redirected to the ${page} page]`);

  const nextPage = `${browser.baseUrl}/${Page[page.toUpperCase()]}`;
  const currentPage = await browser.getCurrentUrl(); // THIS
  log.debug(`Current page: ${currentPage}`);
  log.debug(`Next page: ${nextPage}`);

  const isRedirected = await Application.isRedirected(`${currentPage}`, `${nextPage}`);
  log.debug(`Browser was redirected: ${isRedirected}`);
  
  expect(isRedirected).to.be.true;
  log.info('Redirection checked');
});


Then('The user should see the {itemActivity}(d)(ed) item details of the {item}', async function(action, item) {
  log.info(`=================== [STEP: The user should see the ${action}(d)(ed) item details of the ${item.name}]`);
  
  // if (action === 'updated') {
  //   detailsJSON = browser.params.editedItemDetails[itemName];
  //   const itemValues = await GenericHelper.appendItemIDs(itemConfig.itemSummary, itemConfig.reportingDB, detailsJSON);
  //   const itemPath = browser.baseUrl + '/#/hmws/' + Item.getItemUrl(itemName, itemValues);
  //   await browser.get(itemPath);
  // }
  
  const displayedDetails = {};
  for (let key in item.config.details) {
    const details = item.config.details[key];
    // TODO Add checking for TABLE details
    // Also fix these conditions
    if (details.type === 'TABLE') {
      continue;
    }

    // if (((details.showsOn === 'create' || details.showsOn === 'all') && action !== 'created') || (details.showsOn === 'update' && action !== 'edit')) {
    //   continue;
    // }

    const text = await DetailsPage.$detailField(key).getText();
    if (text) {
      displayedDetails[_.startCase(key)] = text;
    }    
  }
  log.debug(`Data displayed in item details: ${JSON.stringify(displayedDetails)}`);

  // TODO:TOFIX => needs to contain the ones in the created item details
  const detailsDBCols = item.config.summary.map(summary => {
    if (!isNullOrUndefined(summary.detailsID) && !isNullOrUndefined(summary.DBColumn)) {
      return summary.DBColumn;
    }
  }).filter(summary => summary);

  const conditions = await ReportingDB.parseToQueryConditions(browser.params.createdItemDetails[item.name], item.config.summary, ItemSummaryField.DETAILS_ID);
  const rdbItemRow = await ReportingDB.getItem(item.config.reportingDB.tableName, detailsDBCols, conditions);

  // TODO: Move to parseRDBData method of test-helpers
  for (const key in rdbItemRow) {
    const summary = (item.config.summary).find(summary => summary.DBColumn === key);
    const scKey = _.startCase(summary.detailsID);

    if (isNullOrUndefined(rdbItemRow[key]) || !displayedDetails.hasOwnProperty(scKey)) {
      delete rdbItemRow[key];
      continue;
    }

    // const fkey = rdbConfig.foreignKeys;
    // if (fkey && (fkey).hasOwnProperty(key)) {
    //   let res;
    //   if (fkey[key].constructor.name === 'String') {
    //     res = await ReportingDB.getItem(fkey[key], `"UUID" = '${rdbItemRow[key]}'`, "NAME");
    //   } else if (fkey[key].constructor.name === 'Object') {
    //     res = await ReportingDB.getItem(fkey[key]['table'], `"UUID" = '${rdbItemRow[key]}'`, "NAME");
    //   }
    //   rdbItemRow[key] = res.NAME;
    // }

    // if (rdbItemRow[key] instanceof Date) {
    //   rdbItemRow[key] = Item.parseISODate(rdbItemRow[key]);
    // }

  // Pass expectedJSON[key] to a variable for instances where it equals to scKey
    const value = rdbItemRow[key];
    delete rdbItemRow[key];
    rdbItemRow[scKey] = value;
  }

  expect(displayedDetails, `The displayed details of the created ${item.name} does not match the database records`).to.eql(rdbItemRow);
  log.info(`${item.name} details checked`);
});

Then('The user should see details of {items} in the table', async function (item) {
  log.info(`=================== [STEP: The user should see details of ${item.name}/${item.pluralName} in the table]`);
  await ListPage.$loadingIcon.to.be.stale();
  
  const itemTableColumns = item.config.table.columns.map(columns => columns.column);
  let currentTableColumns = (<any> await ListPage.$$columnHeaders.getText()).filter(header => header);

  for (const column of itemTableColumns) {
    const headerText = await (await ListPage.$columnHeader(column)).getText().catch(error => {
      const errorMsg = error.includes(`No element found that contains the text: ${column}`) 
                    ? `The column "${column}" for the ${item.name} table does not exist` : error;
      log.error(errorMsg);
      throw error;
    });

    log.info(`Column: ${column} is present`);
    currentTableColumns = currentTableColumns.filter(header => header !== headerText);
  }

  if (currentTableColumns.length > 0) {
    const errorMsg = `The column/s [${currentTableColumns.join(',')}] exists in the list, but is/were not defined in the Item Configuration. Unsafe to continue.`;
    log.error(errorMsg);
    throw errorMsg;
  }

  log.info(`No missing or extra columns`);

  const tableRDBColumns = item.config.summary.map(summaryRow => summaryRow.DBColumn).filter(dbColumn => (itemTableColumns.map(column => column.toUpperCase()).includes(dbColumn)));
  const expectedData = await ListPage.$$tableRows.getText();
  let originalData = await ReportingDB.getItem(item.config.reportingDB.tableName, tableRDBColumns, item.config.table.filters, item.config.table.orderBy, item.config.table.maxRows);
  originalData.forEach(row => {
    Object.keys(row).forEach(column => {
      return row[column] == null && delete row[column];
    })
  });
  originalData = originalData.map(row => Object.values(row).join(' '));

  let diffIndex = _.reduce(expectedData, (result, value, key) => _.isEqual(value, originalData[key]) ? result : result.concat(key), []);
  while (diffIndex.length > 0) {
    log.warn(`Row ${diffIndex} => "${expectedData[diffIndex]}" of the expected data does not match the original data "${originalData[diffIndex]}"`);
    log.warn(`Trimming spaces of the data to verify true equality`);

    (<any> expectedData[diffIndex]) = expectedData[diffIndex].split(' ').join(' ');
    (<any> originalData[diffIndex]) = expectedData[diffIndex].split(' ').join(' ');
    diffIndex = _.isEqual(expectedData, originalData) 
                  ? _.reduce(expectedData, (result, value, key) => _.isEqual(value, originalData[key]) ? result : result.concat(key), [])
                  : [];
  }
  
  expect(expectedData, `Details found in the page does not match the ones retrived from the database`).to.eql(originalData);
  log.info(`${item.name} details in the table have been checked`);
});