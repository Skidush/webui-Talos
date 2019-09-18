import { Application } from '../utils/utils.exports';

export * from './element_helpers/elementToBe.helper';
export * from './element_helpers/getElement.helper';

export * from './interfaces/item.interface';
export * from './interfaces/generic.interface';

export * from './enum/errors.enum';
export * from './enum/element.enum';
export * from './enum/testGeneric.enum';

// ========================
// Export overridable enums 
// ========================
export const AuthenticationState = Application.getNamespaceModule('AuthenticationState');
export const Role = Application.getNamespaceModule('Role');
export const Page = Application.getNamespaceModule('Page');
export const ItemActivity = Application.getNamespaceModule('ItemActivity');
export const ItemState = Application.getNamespaceModule('ItemState');
export const ItemSingularName = Application.getNamespaceModule('ItemSingularName');
export const ItemPluralName = Application.getNamespaceModule('ItemPluralName');