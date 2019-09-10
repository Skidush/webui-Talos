import { defineParameterType } from 'cucumber'
import { _ } from 'lodash';

import { AuthenticationState, GenericItemAction } from '../../helpers/enum/test.enum';
export class ParamaterUtil {
    static toOrFormat(regexpEnum: any, includeKeys: boolean = false, returnAsRegExp: boolean = true): string | RegExp {
        let values = [];
        Object.keys(regexpEnum).forEach(enumKey => {
            values.push(...[regexpEnum[enumKey]]);
            
            if (includeKeys) {
                values.push(...[_.startCase(_.toLower(enumKey))]);
            }
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
    regexp: ParamaterUtil.toOrFormat(GenericItemAction),
    transformer: s => s.toString(),
    name: 'genericItemAction'
})