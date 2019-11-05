import { browser, protractor } from "protractor";
import * as request from 'request';
import * as log4js from 'log4js';

const EC = protractor.ExpectedConditions;
const root = browser.params.root;

const dateObj = new Date();
const dateNow = `${dateObj.getMonth() + 1}-${dateObj.getDate()}_${dateObj.getHours()}:${dateObj.getMinutes()}`;

export class Application {
    /**
     * Writes logs to stdin and stdout. 
     * Default and only stdout file is `automated_test.log` at the reports folder
     * 
     * @param appenderName name of the log appender 
     */
    static log(appenderName: string): any {
        const logConfig = {
            appenders: {
                out: { type: 'stdout' }
            },
            categories: { default: { appenders: ['out', appenderName], level: browser.params.logLevel } }
        }
        logConfig.appenders[appenderName] = { type: 'file', filename: `reports/automated_test.log` };

        log4js.configure(logConfig);
        
        return log4js.getLogger(appenderName);
    }

    /**
     * Returns the namespace object of the requested module.
     * 
     * @param namespace the namespace of the module being requested
     * @param requestedModulePath the path of the module being requested
     * @param defaultModulePath the fallback path of the import when the requested module is not found
     */
    static getNamespaceModule(
        namespace: string, 
        requestedModulePath: string = `${root}/project/enum/generic.enum`, 
        defaultModulePath: string = `${root}/e2e/helpers/enum/overridable.enum`): any {
        return require(requestedModulePath)[namespace] || require(defaultModulePath)[namespace];
    }

    //TODO Does not wait for redirection if the link is invalid
    /**
     * Checks if the user has been redirected from a url to another
     *
     * @param oldUrl the url before redirection
     * @param newUrl the url after redirection
     * @param timeout the time to wait for the redirection to occur in milliseconds
     * @returns a promise that represent if the user has been redirected
     */  
    static async isRedirected(oldUrl: string, newUrl: string, timeout: number = browser.allScriptsTimeout): Promise<boolean> {
        const log = this.log('Application(isRedirected) => Checking redirection');
        let redirected = true;
        
        log.debug(`Old url: ${oldUrl} --- New url: ${newUrl}`);
        await browser.wait(EC.urlIs(newUrl), timeout).catch(() => {
            log.error(`The browser was not redirected: to ${newUrl} after ${timeout}`);
            redirected = false;
        });
        const currentUrl = await browser.getCurrentUrl();
        log.debug(`Url after redirection: ${currentUrl}`);

        redirected = !(currentUrl === oldUrl);
        log.debug(`Redirected: ${redirected}`);
        return redirected;
    }

    /**
     * Executes the API called with a super agent
     * 
     * @param callback the callback
     */
    static async executeAPI(callback: (err, res) => any | void): Promise<any|void> {
        request.get(`${browser.baseUrl}/api/login?user=hmws&pass=test`, {
            headers: {
                ['Accept']:'application/json'
            }
        }, (err, res) =>{
            return callback(err, res);
        });
    }

    /**
     * Erases the item/s from the system
     * 
     * @param uuids an array of UUIDs to delete
     */
    static async eraseItems(uuids: Array<string>): Promise<void> {
        let count = 0;
        Application.executeAPI((err, res) => {
            if (err) {
                throw err;
            }

            for (const uuid of uuids) {
                const auth = res.headers["set-cookie"][0].split(';')[0];
                this.log('Application(eraseItems) => Erasing item').info(`${browser.baseUrl}/api/item/${uuid}/workflow/predefined/Erase`);
                request.post(`${browser.baseUrl}/api/item/${uuid}/workflow/predefined/Erase`, {
                    headers: {
                        ['withCredentials']: 'true',
                        ['responseType']: 'text/xml',
                        ['Content-Type']: 'application/xml',
                        ['Accept']: 'application/json',
                        ['Cookie']: auth
                    }
                }, (err)=>{
                    if (err) {
                        throw err;
                    }
                    count++;
                });
            }
        });

        while (count !== uuids.length) {};

        return;
    }

  /**
   * Closes an open browser alert
   */
  static async closeAlert() {
    return await browser.switchTo().alert().then(async (alert) => {
      await alert.accept();
    });
  }
}