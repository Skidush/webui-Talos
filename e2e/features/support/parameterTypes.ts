import { defineParameterType } from 'cucumber'
import { _ } from 'lodash';
import { ItemNameSingular, AuthState, Role, TestAction, Page, ItemNamePlural } from '../../helpers/enum/test.enum';

// TODO: Segregate hmws specific parameter types from generic parameters
class ParamaterUtil {
    static toRegExpOr(regexpEnum: any, includeKeys: boolean = false, valuesToSentenceCase: boolean = false): RegExp {
        const regExpArr = [];
        Object.keys(regexpEnum).forEach(enumKey => {
            const enumValue = valuesToSentenceCase ? _.startCase(_.toLower(regexpEnum[enumKey])) : regexpEnum[enumKey];
            regExpArr.push(...[enumValue]);
            
            if (includeKeys) {
                regExpArr.push(...[_.startCase(_.toLower(enumKey))]);
            }
        });
        return new RegExp(regExpArr.toString().split(',').join('|'));
    }

    static appendToRegExp(regExp: RegExp, stringToAppend: string): RegExp {
        return new RegExp(regExp.toString().replace(/\//g, '').concat(`|${stringToAppend}`));
    }
}

defineParameterType({
    regexp: `${ParamaterUtil.appendToRegExp(ParamaterUtil.toRegExpOr(Page, true), 'Login|Dashboard')}`,
    transformer: s => s.toString(),
    name: 'page'
});

defineParameterType({
    regexp: ParamaterUtil.toRegExpOr(ItemNameSingular, true),
    transformer: s => s.toString(),
    name: 'item'
});

defineParameterType({
    regexp: ParamaterUtil.toRegExpOr(ItemNamePlural, true),
    transformer: s => s.toString(),
    name: 'items'
});

defineParameterType({
    regexp: ParamaterUtil.toRegExpOr(AuthState),
    transformer: s => s.toString(),
    name: 'authState'
});

defineParameterType({
    regexp: ParamaterUtil.toRegExpOr(Role),
    transformer: s => s.toString(),
    name: 'role'
});

defineParameterType({
    regexp: ParamaterUtil.toRegExpOr(TestAction),
    transformer: s => s.toString(),
    name: 'action'
})