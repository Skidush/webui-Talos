import { defineParameterType } from 'cucumber'
import { _ } from 'lodash';

import { Item } from '../../../e2e/classes/item.class';
import { ParamaterUtil } from '../../../e2e/features/support/parameterTypes';
import { Page, ItemSingularName, ItemPluralName, Role } from '../../enum/test.enum';

defineParameterType({
    regexp: ParamaterUtil.toOrFormat(ItemSingularName, true),
    transformer: s => new Item(s),
    name: 'item'
});

defineParameterType({
    regexp: ParamaterUtil.toOrFormat(ItemPluralName, true),
    transformer: s => new Item(s),
    name: 'items'
});

defineParameterType({
    regexp: ParamaterUtil.toOrFormat(Page, true),
    transformer: s => s.toString(),
    name: 'page'
});

defineParameterType({
    regexp: ParamaterUtil.toOrFormat(Role),
    transformer: s => s.toString(),
    name: 'role'
});