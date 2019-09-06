import { browser, protractor } from "protractor";
import * as request from 'request';

const log4js = require('log4js');
const EC = protractor.ExpectedConditions;

export class Application {
    /**
     * Writes logs to stdin and stdout. Default and only stdout file is `automated_test.log` at the root folder
     * @param appenderName name of the appender 
     */
    // TODO change stdout file. Separate logs from separate runs
    static log(appenderName: string) {
        const thisLog = log4js;
        const logConfig = {
            appenders: {
                out: { type: 'stdout' }
            },
            categories: { default: { appenders: ['out', appenderName], level: browser.params.logLevel } }
        }
        logConfig.appenders[appenderName] = { type: 'file', filename: 'automated_test.log' };

        thisLog.configure(logConfig);
        return thisLog.getLogger(appenderName);
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
    static async isRedirected(oldUrl: string, newUrl: string, timeout: number = browser.allScriptsTimeout) {
        const log = this.log('Application(isRedirected) => Checking redirection');
        let redirected = true;
        
        log.debug(`Old url: ${oldUrl} --- New url: ${newUrl}`);
        await browser.wait(EC.urlIs(newUrl), timeout).catch(() => {
            log.error(`The browser was not redirected: to ${newUrl} after ${timeout}`);
            redirected = false;
        });

        const currentUrl = await browser.getCurrentUrl();
        log.debug(`Url after redirection: ${currentUrl}`);

        if (currentUrl === oldUrl) {
            redirected = false;
        }

        log.debug(`Redirected: ${redirected}`);
        return redirected;
    }

    /**
     * Checks the local storage value `loggedIn` to check if an agent is logged in
     */
    static async isLoggedIn(): Promise<boolean> {
        const isLoggedIn: string = await browser.executeScript("return window.localStorage.getItem('loggedIn');");
        return isLoggedIn === "true";
    }

    /**
     * Erases the item/s from the system
     * @param uuids an array of UUIDs to delete
     */
    static async eraseItems(uuids: Array<string>): Promise<void> {
        let count = 0;
        request.get(`${browser.baseUrl}/api/login?user=hmws&pass=test`, {
            headers: {
                ['Accept']:'application/json'
            }
        }, (err, res) =>{
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
        
        do {
            // dont exit
        } while (count !== uuids.length);

        return;
    }
}