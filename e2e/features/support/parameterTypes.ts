import { defineParameterType } from 'cucumber'
import { _ } from 'lodash';

import { Item } from '../../classes/classes.exports';
import { 
    AuthenticationState, 
    ItemActivity, Role, Page, 
    ItemSingularName, 
    ItemState, 
    ItemPluralName } from '../../helpers/helper.exports';
import { browser } from 'protractor';

export class ParamaterUtil {
    static toOrFormat(stringToTransform: any, includeKeys: boolean = false, returnAsRegExp: boolean = true): string | RegExp {
        let values = [];
        Object.keys(stringToTransform).forEach(enumKey => {
            values.push(...[stringToTransform[enumKey]]);
            
            includeKeys && values.push(...[_.startCase(_.toLower(enumKey))]);
        });
        const valuesStr = values.toString().split(',').join('|'); 
        return returnAsRegExp ? new RegExp(valuesStr) : valuesStr;
    }

    static appendToRegExp(regExp: RegExp, regExpToAppend: string): RegExp {
        return new RegExp(regExp.toString().replace(/\//g, '').concat(`${regExpToAppend}`));
    }
}

defineParameterType({
    regexp: ParamaterUtil.toOrFormat(AuthenticationState),
    transformer: s => s.toString(),
    name: 'authenticationState'
});

defineParameterType({
    regexp: ParamaterUtil.toOrFormat(ItemActivity),
    transformer: s => s.toString(),
    name: 'itemActivity'
});

defineParameterType({
    regexp: ParamaterUtil.toOrFormat(ItemState, true),
    transformer: s => s.toString(),
    name: 'itemState'
});

defineParameterType({
    regexp: ParamaterUtil.toOrFormat(Role),
    transformer: s => s.toString(),
    name: 'role'
});

defineParameterType({
    regexp: ParamaterUtil.toOrFormat(Page, true),
    transformer: s => s.toString(),
    name: 'page'
});

defineParameterType({
    regexp: ParamaterUtil.toOrFormat(ItemSingularName, true),
    transformer: s => {
        const item = new Item(s);
        const existingIndex = browser.params.initializedItems.findIndex(initializedItem => initializedItem.name === item.name);
        
        if (existingIndex > 0) {
            return browser.params.initializedItems[existingIndex];    
        }

        browser.params.initializedItems.push(item);
        return item;
    },
    name: 'item'
});

defineParameterType({
    regexp: ParamaterUtil.toOrFormat(ItemPluralName, true),
    transformer: s => {
        const item = new Item(s);
        const existingIndex = browser.params.initializedItems.findIndex(initializedItem => initializedItem.name === item.name);
        
        if (existingIndex > 0) {
            return browser.params.initializedItems[existingIndex];    
        }

        browser.params.initializedItems.push(item);
        return item;
    },
    name: 'items'
});