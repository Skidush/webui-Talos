import { Given, When, Then } from 'cucumber';
import { browser } from 'protractor';
import * as _ from 'lodash';

import { Item, Page, TestAction, ReportingDB, ItemSummaryField } from '../helpers/helper.exports';
import { Application } from '../utils/utils.exports';
import { DetailsPage } from '../po/details.po';
import { isNullOrUndefined } from 'util';

const chai = require('chai').use(require('chai-as-promised'));
const expect = chai.expect;
const log = Application.log(browser.params.currentScenario);

Given('The user is on the {page} page', async function (page) {
  const path = `${browser.baseUrl}/${Page[page.toUpperCase()]}`;
  const currentUrl = await browser.getCurrentUrl();

  log.info(`Step: The user is on ${page} page`);
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

Given('A/An {itemState} {item} exists', async function (state, itemName) {
  log.info(`Step: A/An ${itemName} exists`);
  const item = new Item(itemName);

  if (!await (await ReportingDB.getItem(item.rdbTableName, "STATE", {STATE: state}))){
    
  };
});

When('The user {action}(s) a/an {item}', async function (action, itemName) {
  log.info(`Step: The user ${action}(s) a/an ${itemName}`);

  const item = new Item(itemName);
    switch (action) {
      case TestAction.CREATE:
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

Then('The user should be redirected to the details page of the created {item}', async function (itemName) {
  log.info(`Step: The user should be redirected to the details page of the created ${itemName}`)
  const item = new Item(itemName);
  const itemUrl = `${browser.baseUrl}/${item.url.substring(0, item.url.indexOf('{') - 1)}/${encodeURI(browser.params.createdItemDetails[itemName][_.camelCase(item.identifier)])}`;

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


Then('The user should see the {action}(d)(ed) item details of the {item}', async function(action, itemName) {
  log.info(`Step: The user should see the ${action}(d)(ed) item details of the ${itemName}`);
  const item = new Item(itemName);
  
  // if (action === 'updated') {
  //   detailsJSON = browser.params.editedItemDetails[itemName];
  //   const itemValues = await GenericHelper.appendItemIDs(itemConfig.itemSummary, itemConfig.reportingDB, detailsJSON);
  //   const itemPath = browser.baseUrl + '/#/hmws/' + Item.getItemUrl(itemName, itemValues);
  //   await browser.get(itemPath);
  // }
  
  const displayedDetails = {};
  for (let key in item.detailsConfig) {
    const details = item.detailsConfig[key];
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
  });

  const conditions = await ReportingDB.parseToQueryConditions(browser.params.createdItemDetails[itemName], item.summary, ItemSummaryField.SCHEMA_ID);
  const rdbItemRow = await ReportingDB.getItem(item.rdbTableName, detailsDBCols, conditions);

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