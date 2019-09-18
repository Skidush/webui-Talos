import { element, by } from 'protractor';
import { WebuiElement } from '../classes/classes.exports';
import { GetElementBy } from '../helpers/helper.exports';
import { Application } from '../utils/utils.exports';

const log = Application.log('Login');

export enum LoginPageElement {
    USERNAME_FIELD = 'cristalise-login input[id="username"]',
    PASSWORD_FIELD = 'cristalise-login input[id="password"]',
    LOGIN_BUTTON = 'cristalise-login button[id="login"]'
}
export class LoginPage {
    // Defaults to Admin login
    static async login(username: string = 'hmws', password: string = 'test') {
        log.info('Executing login action');

        (await this._usernameField).sendKeys(username);
        (await this._passwordField).sendKeys(password);
        (await this._loginButton).click();
    }

    static get _usernameField(): Promise<WebuiElement> {
        return GetElementBy.elementFinder(element(by.css(LoginPageElement.USERNAME_FIELD)));
    }

    static get _passwordField(): Promise<WebuiElement> {
        return GetElementBy.elementFinder(element(by.css(LoginPageElement.PASSWORD_FIELD)));
    }

    static get _loginButton(): Promise<WebuiElement> {
        return GetElementBy.elementFinder(element(by.css(LoginPageElement.LOGIN_BUTTON)));
    }
}