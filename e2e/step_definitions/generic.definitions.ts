import { Given, When, Then } from 'cucumber';
import { browser } from 'protractor';
import { isNullOrUndefined } from 'util';
import * as _ from 'lodash';

import { ReportingDB } from '../classes/classes.exports';
import { ItemActivity, ItemSummaryField, Page } from '../helpers/helper.exports';
import { Application } from '../utils/utils.exports';

import { DetailsPage, ListPage } from '../po/po.exports';
import { ParamaterUtil } from '../features/support/parameterTypes';

const chai = require('chai').use(require('chai-as-promised'));
const expect = chai.expect;
const log = Application.log(browser.params.currentScenario);

/**
 * Expression:
 * ================================================================
 * The user (is on/navigates to) the {page} page
 * ================================================================
 * Usage:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * The user is on the {page}
 * The user navigates to the {page}
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Examples:
 * ----------------------------------------------------------------
 * The user is on the Capabilities page
 * The user navigates to the Capabilities page
 * ----------------------------------------------------------------
 */ 
Given(new RegExp(`^The user (?: is on|navigates to) the (${ParamaterUtil.toOrFormat(Page, true, false)}) page$`), async function (page) {
  const path = `${browser.baseUrl}/${Page[page.toUpperCase()]}`;
  const currentUrl = await browser.getCurrentUrl();

  log.info(`Step: The user is on the ${page} page`);
  log.info(`Navigating to ${path}`);
  
  await browser.get(path);
  
  const isRedirected = await Application.isRedirected(currentUrl, path);
  if (!isRedirected) {
    const _err = `The browser was not redirected to: ${path}`;
    log.debug(`Current url: ${currentUrl}`);
    log.error(_err);
    throw _err;
  }
});

Given('A/An {itemState} {item} exists', async function (state, item) {
  log.info(`Step: A/An ${state} ${item.name} exists`);
  
  await (await item.reportingDBInstances({STATE: state}, 1));
});

When('The user {itemActivity}(s) a/an {item}', async function (action, item) {
  log.info(`Step: The user ${action}(s) a/an ${item.name}`);

    switch (action) {
      case ItemActivity.CREATE:
        await item.create();
        break;
      // case 'edit':
      //   await Item.edit(itemName);
      //   break;
      // case 'delete':
      //   await Item.delete(itemName);
      //   break;
    }
});

Then('The user should be redirected to the details page of the created {item}', async function (item) {
  log.info(`Step: The user should be redirected to the details page of the created ${item.name}`)
  const itemUrl = `${browser.baseUrl}/${item.url.substring(0, item.url.indexOf('{') - 1)}/${encodeURI(browser.params.createdItemDetails[item.name][_.camelCase(item.identifier)])}`;

  expect(await browser.getCurrentUrl(), `The browser was not redirected to ${itemUrl}`).to.equal(itemUrl);
  log.info('Redirection checked');
});

Then('The user should be redirected to the {page} page', async function (page) {
  log.info(`Step: The user should be redirected to the ${page} page`);

  const nextPage = `${browser.baseUrl}/${Page[page.toUpperCase()]}`;
  const currentPage = `${browser.baseUrl}/${Page.LOGIN}`;
  log.debug(`Current page: ${currentPage}`);
  log.debug(`Next page: ${nextPage}`);

  const isRedirected = await Application.isRedirected(`${currentPage}`, `${nextPage}`);
  log.debug(`Browser was redirected: ${isRedirected}`);
  
  expect(isRedirected).to.be.true;
  log.info('Redirection checked');
});


Then('The user should see the {itemActivity}(d)(ed) item details of the {item}', async function(action, item) {
  log.info(`Step: The user should see the ${action}(d)(ed) item details of the ${item.name}`);
  
  // if (action === 'updated') {
  //   detailsJSON = browser.params.editedItemDetails[itemName];
  //   const itemValues = await GenericHelper.appendItemIDs(itemConfig.itemSummary, itemConfig.reportingDB, detailsJSON);
  //   const itemPath = browser.baseUrl + '/#/hmws/' + Item.getItemUrl(itemName, itemValues);
  //   await browser.get(itemPath);
  // }
  
  const displayedDetails = {};
  for (let key in item.details) {
    const details = item.details[key];
    // TODO Add checking for TABLE details
    // Also fix these conditions
    if (details.type === 'TABLE') {
      continue;
    }

    // if (((details.showsOn === 'create' || details.showsOn === 'all') && action !== 'created') || (details.showsOn === 'update' && action !== 'edit')) {
    //   continue;
    // }

    const text = await (await DetailsPage._detailField(key)).getText();
    if (!text) {
      continue;
    }
    
    displayedDetails[_.startCase(key)] = text;
  }
  log.debug(`Data displayed in item details: ${displayedDetails}`);

  // TODO:TOFIX => needs to contain the ones in the created item details
  const detailsDBCols = item.summary.map(summary => {
    if (!isNullOrUndefined(summary.detailsID) && !isNullOrUndefined(summary.DBColumn)) {
      return summary.DBColumn;
    }
  }).filter(summary => summary);

  const conditions = await ReportingDB.parseToQueryConditions(browser.params.createdItemDetails[item.name], item.summary, ItemSummaryField.DETAILS_ID);
  const rdbItemRow = await ReportingDB.getItem(item.reportingDB.tableName, detailsDBCols, conditions);

  // TODO: Move to parseRDBData method of test-helpers
  for (const key in rdbItemRow) {
    const summary = (item.summary).find(summary => summary.DBColumn === key);
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

  expect(displayedDetails).to.eql(rdbItemRow);
  log.info(`Item details checked`);
});

Then('I should see details of {items} in the table', async function (item) {
  // const rdbListData = await ReportingDB.getItemTableData(itemConfig.reportingDB, itemConfig.tableConfig, itemConfig.itemSummary);
  // Column checking. Wait for all columns to load
  for (const column of item.summary.map(summaryRow => summaryRow.tableColumn).filter(column => column)) {
    await ListPage._columnHeader(column).catch((_err) => {
      _err.includes(`No element found that contains the text: ${column}`) && log.warn(_err);   
    });
  }
  const headers = await ListPage._columnHeaders.getText();
  console.log(headers);
  console.log(typeof headers);

  //   await ElementToBe.stale(ItemList.getTableLoadingIconElement());
  //   // TODO:TOFIX there is a millisecond that when the loading element would disappear, the row would still be there 
  //   await browser.sleep(800);

  //   const tableRows = ItemList.getTableRows();
  //   await ElementToBe.present(tableRows.first());
  //   await ElementAction.scrollIntoView(await tableRows.first());
    
  //   // Parse the data from Reporting DB to match the format of the data extracted from the table
  //   const databaseData = await Item.parseRDBData(rdbListData, itemConfig.reportingDB);
  //   const itemListData = await ElementAction.getText(tableRows);

  //   expect(itemListData).to.have.members(databaseData);
  // } catch (err) {
  //   if (view === 'not see' && err.toString().includes("No database result found for query:")) {
  //     expect(true).to.be.true;
  //   } else {
  //     throw err;
  //   }
  // }
});