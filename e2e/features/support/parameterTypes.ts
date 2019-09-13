import { defineParameterType } from 'cucumber'
import { _ } from 'lodash';

import { AuthenticationState, ItemActivity, Role, Page, ItemState } from '../../helpers/helper.exports';

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
