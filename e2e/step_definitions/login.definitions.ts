import { When, Then } from 'cucumber';
import { browser } from 'protractor';

import { AuthenticationState, Role } from '../helpers/helper.exports';
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

// 'The user should be/is {authenticationState} (as {role})'
Then(new RegExp(`^The user (should be|is) (${Application.objectToOrString(AuthenticationState)})(\\sas ${Application.objectToOrString(Role)})?$`), async function (tense, authState, role) {
  const log = Application.log(browser.params.currentScenario);
  log.info(`Step: The user should be ${authState} (as ${role || '(role)'})`);
  
  if (role) {
    role = role.replace(' as ', '');
  }

  switch (authState) {
    case AuthenticationState.LOGGED_IN:
      log.info(`Checking login state and/or role`);

      const userRole = await browser.executeScript("return window.localStorage.getItem('roles');");
      const actualAuthData = {
        loggedIn: await Application.isLoggedIn(),
        loggedInAsRole: role ? (<string> userRole).includes(role) : false
      }

      const expectedAuthData = {
        loggedIn: false,
        loggedInAsRole: role ? true : false
      }
      
      log.debug(`User is logged in: ${actualAuthData.loggedIn} --- User role: ${userRole || 'not defined'}`);
      expect(actualAuthData).to.eql(expectedAuthData);
      log.info(`User is logged in with the role ${role}`);
      break;
    
    case AuthenticationState.LOGGED_OUT:
      break;
  }
});