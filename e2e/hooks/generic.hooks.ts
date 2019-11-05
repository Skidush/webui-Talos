import { Before, BeforeAll, After, setDefaultTimeout } from 'cucumber';
import { browser, protractor } from 'protractor';
import { Application } from '../utils/utils.exports';
import { LoginPage, ToolbarPage } from '../po/po.exports';

const EC = protractor.ExpectedConditions;
const log = Application.log(`Hooks`);

BeforeAll(async () => {
    browser.waitForAngularEnabled(false);
    setDefaultTimeout(60 * 10000);
});

Before((scenario) => {
    browser.params.currentScenario = scenario.pickle.name;
    log.info(`Scenario: ${browser.params.currentScenario}`);
});

Before(({tags: 'not @Login'}), async (scenario) => {
    const currentUrl = await browser.getCurrentUrl();
    // Close alerts if any 
    await Application.closeAlert().then(() => {}, () => {
        // No open alerts
    });

    // Close open dialogs
    if (await ToolbarPage.$dialog.$element.isPresent()) {
        await ToolbarPage.closeDialog('Yes');
    }

    // Check if logged out, else login
    if (currentUrl === 'data:,') {
        log.info('User is not logged in. Executing login action');
        
        browser.get(`${browser.baseUrl}/#/login`);
        await browser.wait(EC.urlIs(`${browser.baseUrl}/#/login`), browser.params.defaultTimer);
        await LoginPage.login();
        while(!(await LoginPage.isLoggedIn())) {
            // Wait until user is logged in
        }
        log.info('Login action executed');
    }
});

After(async function(scenario) {
    browser.params.initializedItems.forEach(item => {
        item.instance = {};
    });
    
    const world = this;
    if (scenario.result.status === 'failed') {
        if (!scenario.result.exception.message.includes('No database result found')) {
            await browser.takeScreenshot().then(buffer => {
                return world.attach(buffer, 'image/png');
            });
        }
    }
});

// AfterAll(async () => {
//     const uuids = browser.params.createdItemUUIDs; 
//     if (uuids !== 0) {
//         console.log('\n\n [ERASING CREATED DATA]')
//         await Application.eraseItems(uuids);
//     }
// });