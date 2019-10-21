// Add to item interface
export enum ItemPluralName {
    CAPABILITY                  = "Capabilities",
    COMPANY                     = "Companies",
    "CONTACT PERSON"            = "Contact Persons",
    DEPARTMENT                  = "Departments",
    EMPLOYEE                    = "Employees",
    MACHINE                     = "Machines",
    "MANUFACTURING WORK ORDER"  = "Manufacturing Work Orders",
    "PARTS WORK ORDER"          = "Parts Work Orders",
    PRODUCT                     = "Products",
    "PRODUCT CATEGORY"          = "Product Categories",
    "PURCHASE ORDER"            = "Purchase Orders",
    SHIFT                       = "Shifts",
    SKILL                       = "Skills",
    "TASK TYPE"                 = "Task Types",
    "WORK ORDER"                = "Work Orders"
}

export enum ItemSingularName {
    CAPABILITY                  = "Capability",
    COMPANY                     = "Company",
    "CONTACT PERSON"            = "Contact Person",
    DEPARTMENT                  = "Department",
    EMPLOYEE                    = "Employee",
    MACHINE                     = "Machine",
    "MANUFACTURING WORK ORDER"  = "Manufacturing Work Order",
    "PARTS WORK ORDER"          = "Parts Work Order",
    PRODUCT                     = "Product",
    "PRODUCT CATEGORY"          = "Product Category",
    "PURCHASE ORDER"            = "Purchase Order",
    SHIFT                       = "Shift",
    SKILL                       = "Skill",
    "TASK TYPE"                 = "Task Type",
    "WORK ORDER"                = "Work Order"
}

export enum Role {
    ADMIN = 'Admin',
    CONTACT_PERSON = 'Contact Person'
}

export enum Page {
    LOGIN = '#/login',
    DASHBOARD = '#/dashboard',
    CAPABILITIES = '#/hmws/capabilities',
}

export enum ItemActivity {
    CREATE = 'create',
    EDIT = 'edit',
    DELETE = 'delete'
}

export enum ItemState {
    ACTIVE = 'ACTIVE',
    DEACTIVATED = 'DEACTIVATED'
}

export enum TestValue {
    CREATE = 'create',
    EDIT = 'edit',
    DUPLICATE = 'duplicate'
}

export enum TestValueParam {
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

export enum View {
    SEE = 'see',
    NOT_SEE = 'not see'
}