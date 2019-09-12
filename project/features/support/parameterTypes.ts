import { defineParameterType } from 'cucumber'
import { _ } from 'lodash';

import { Item } from '../../../e2e/classes/item.class';
import { ParamaterUtil } from '../../../e2e/features/support/parameterTypes';
import { ItemSingularName, ItemPluralName } from '../../enum/generic.enum';

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