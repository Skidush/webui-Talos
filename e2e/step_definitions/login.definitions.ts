import { When, Then } from 'cucumber';
import { browser } from 'protractor';

import { AuthenticationState } from '../helpers/helper.exports';
import { Application } from '../utils/utils.exports';

import { LoginPage } from '../po/po.exports';

const chai = require('chai').use(require('chai-as-promised'));
const expect = chai.expect;

When('The user logs in as {role}', async function (role) {
  const log = Application.log(browser.params.currentScenario);
  log.info(`Step: I login as ${role}`);

  const userData = (browser.params.agents).find(agent => agent.role === role);
  const username = userData.username;
  const password = userData.password;

  log.debug(`Role: ${role}, Username: ${username}, Password: ${password}`);
  log.info(`Logging in user: ${username}`);
  await LoginPage.login(username, password);
});

Then('The user should be {authenticationState} as {role}', async function (authState, role) {
  const log = Application.log(browser.params.currentScenario);
  log.info(`Step: The user should be ${authState} as ${role}`);

  switch (authState) {
    case AuthenticationState.LOGGED_IN:
      log.info(`Checking login state and role`);
      
      const isLoggedIn = await Application.isLoggedIn();   
      const userRoles: string = await browser.executeScript("return window.localStorage.getItem('roles');");

      log.debug(`User is logged in: ${isLoggedIn} --- User role: ${userRoles}`);

      expect({ loggedIn: isLoggedIn, includesRole: userRoles.includes(role) }).to.eql({ loggedIn: true, includesRole: true });
      log.info(`User is logged in with the role ${role}`);
      break;
    
    case AuthenticationState.LOGGED_OUT:
      break;
  }
});