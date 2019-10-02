export enum ElementCommand {
    SCROLL_INTO_VIEW,
    SEND_KEYS,
    GET_ATTRIBUTE,
    GET_TEXT,
    CLICK,
    CLEAR,
    CHECK_PRESENCE,
    CHECK_DISPLAY
}
  
export enum ElementCommandCycle {
    RETRY,
    WAIT
}

export enum SelectorParameter {
    ID = '{ID}',
    LABEL = '{LABEL}',
    FOR = '{FOR}'
}

export enum FormField {
    TEXTAREA = 'textarea',
    INPUT = 'input',
    DATE = 'date',
    DROPDOWN = 'dropdown',
    AUTOCOMPLETE_INPUT = 'autocomplete-input',
    AUTOCOMPLETE_DROPDOWN = 'autocomplete-dropdown'
}