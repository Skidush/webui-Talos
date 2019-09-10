export enum AuthenticationState {
    LOGGED_IN = 'logged in',
    LOGGED_OUT = 'logged out'
}

export enum GenericItemAction {
    CREATE = 'create',
    EDIT = 'edit',
    DELETE = 'delete'
}

export enum ItemValueParameter {
    RANDOM_NUM = '{randomNumber}'
}
  
export enum SchemaFieldElement {
    ID      = 'ID',
    CAPTION = 'caption',
    FIELD   = 'field',
}
  
export enum ShowsOn {
    ALL     = 'all',
    CREATE  = 'create',
    UPDATE  = 'update',
    DELETE  = 'delete'
}
  
export enum ToolbarAction {
    CREATE  = 'create',
    EDIT    = 'edit',
    DELETE  = 'delete'
}