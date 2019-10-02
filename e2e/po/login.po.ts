import { $, browser } from 'protractor';
import { WebuiElement } from '../classes/classes.exports';
import { Page } from '../helpers/helper.exports';
import { Application } from '../utils/utils.exports';

const log = Application.log('Login');

export enum LoginPageElement {
    USERNAME_FIELD = 'cristalise-login input[id="username"]',
    PASSWORD_FIELD = 'cristalise-login input[id="password"]',
    LOGIN_BUTTON = 'cristalise-login button[id="login"]'
}
export class LoginPage {
    static async get() {
        await browser.get(`${browser.baseUrl}/${Page.LOGIN}`);
    }

    /**
     * Checks the local storage value `loggedIn` to check if an agent is logged in
     */
    static async isLoggedIn(): Promise<boolean> {
        const isLoggedIn: string = await browser.executeScript("return window.localStorage.getItem('loggedIn');");
        return isLoggedIn === "true";
    }

    // Defaults to Admin login
    static async login(username: string = 'hmws', password: string = 'test') {
        log.info('Executing login action');

        await this.$usernameField.sendKeys(username);
        await this.$passwordField.sendKeys(password);
        await this.$loginButton.click();
    }

    static get $usernameField(): WebuiElement {
        return new WebuiElement($(LoginPageElement.USERNAME_FIELD));
    }

    static get $passwordField(): WebuiElement {
        return new WebuiElement($(LoginPageElement.PASSWORD_FIELD));
    }

    static get $loginButton(): WebuiElement {
        return new WebuiElement($(LoginPageElement.LOGIN_BUTTON));
    }
}