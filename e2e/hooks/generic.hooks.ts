import { Before, BeforeAll, After, setDefaultTimeout } from 'cucumber';
import { browser, protractor } from 'protractor';
import { Application } from '../utils/utils.exports';
import { LoginPage } from '../po/po.exports';

const EC = protractor.ExpectedConditions;

BeforeAll(async () => {
    browser.waitForAngularEnabled(false);
    setDefaultTimeout(60 * 10000);
});

Before((scenario) => {
    browser.params.currentScenario = scenario.pickle.name;
    const log = Application.log(`GenericHooks(Before)`);

    log.info(`Scenario: ${browser.params.currentScenario}`);
});

Before(({tags: 'not @Login'}), async (scenario) => {
    const log = Application.log(`GenericHooks(Before {not @Login})`);
    const currentUrl = await browser.getCurrentUrl();

    // // Close alerts if any 
    // await GenericHelper.closeAlert().then(() => {}, () => {
    //     // Catch rejection of promise but don't do anything
    // });

    // if (await element(by.css(ToolbarElement.DIALOG)).isPresent()) {
    //     await GenericHelper.closeDialog('Yes');
    // }

    // Check if logged out, else login
    if (currentUrl === 'data:,') {
        log.info('User is not logged in. Executing login action');
        
        browser.get(`${browser.baseUrl}/#/login`);
        await browser.wait(EC.urlIs(`${browser.baseUrl}/#/login`), browser.params.defaultTimer);
        await LoginPage.login();
        while(!(await Application.isLoggedIn())) {
            // Wait until user is logged in
        }
        log.info('Login action executed');
    }
});

After(async function(scenario) {
    browser.params.initializedItems.forEach(item => {
        item.instance = {};
    });
//     const world = this;
//     if (scenario.result.status === 'failed') {
//         // Close alerts if any 
//         await GenericHelper.closeAlert().then(() => {}, () => {
//             // Catch rejection of promise but don't do anything
//         });

//         if (!scenario.result.exception.message.includes('No database result found')) {
//             await browser.takeScreenshot().then(buffer => {
//                 return world.attach(buffer, 'image/png');
//             });
//         }
//     }
//     console.timeEnd('\nScenario done in');
//     console.log('===============================================================');
});

// AfterAll(async () => {
//     const uuids = browser.params.createdItemUUIDs; 
//     if (uuids !== 0) {
//         console.log('\n\n [ERASING CREATED DATA]')
//         await Application.eraseItems(uuids);
//     }
// });