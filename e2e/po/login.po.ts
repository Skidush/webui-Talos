import { element, by } from 'protractor';
import { WebuiElement } from '../classes/classes.exports';
import { GetElementBy } from '../helpers/helper.exports';
import { Application } from '../utils/utils.exports';

const log = Application.log('Login');

export enum LoginPageElement {
    USERNAME = 'cristalise-login input[id="username"]',
    PASSWORD = 'cristalise-login input[id="password"]',
    LOGIN = 'cristalise-login button[id="login"]'
}
export class LoginPage {
    // Defaults to Admin login
    static async login(username: string = 'hmws', password: string = 'test') {
        log.info('Executing login action');

        const usernameField = await this._usernameField;
        const passwordField = await this._passwordField;
        const loginButton = await this._loginButton;

        await usernameField.sendKeys(username);
        log.info(`Username: ${username} entered in the username field`);

        await passwordField.sendKeys(password);
        log.info(`Password: ${password} entered in the password field`);

        await loginButton.click();
        log.info('Login button clicked');
    }

    static get _usernameField(): Promise<WebuiElement> {
        return GetElementBy.elementFinder(element(by.css(LoginPageElement.USERNAME)));
    }

    static get _passwordField(): Promise<WebuiElement> {
        return GetElementBy.elementFinder(element(by.css(LoginPageElement.PASSWORD)));
    }

    static get _loginButton(): Promise<WebuiElement> {
        return GetElementBy.elementFinder(element(by.css(LoginPageElement.LOGIN)));
    }
}