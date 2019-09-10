import { ToolbarAction, FormField, ShowsOn } from "../helper.exports";

export interface ItemConfig {
  readonly name: string,
  readonly pluralName: string,
  readonly identifier: string,
  readonly summary: Array<ItemSummary>,
  readonly toolbar: Toolbar,
  readonly schema: Array<SchemaField>,
  readonly table: Table,
  readonly details: Details,
  readonly reportingDB: ReportingDB,
  readonly url: string
}

export enum ItemSummaryField {
  SCHEMA_ID       = 'schemaID',
  TABLE_COLUMN    = 'tableColumn',
  DETAILS_ID      = 'detailsID',
  DBCOLUMN        = 'DBColumn'
}
  
export type ItemSummary = {
  [ItemSummaryField.SCHEMA_ID]: string, 
  [ItemSummaryField.TABLE_COLUMN]: string, 
  [ItemSummaryField.DETAILS_ID]: string, 
  [ItemSummaryField.DBCOLUMN]: string
}

export type Table = {
  filters: Filter,
  orderBy: Array<string>,
  maxRows: number,
  tableSelector: string
}

export type Details = {
  [member: string]: DetailsField
}

type Toolbar = {
  toolbars: Array<string>
  actions: ToolbarActions
}

interface ToolbarActions {
  [ToolbarAction.CREATE]?: string, 
  [ToolbarAction.EDIT]?: string, 
  [ToolbarAction.DELETE]?: string, 
}

export interface SchemaField {
  ID: string,
  caption: string,
  field: FormField,
  value?: string
}

type Filter = {
  [member: string]: string
}

interface DetailsField {
  caption: string,
  type: string, // TODO Field types
  showsOn: ShowsOn
}

interface ReportingDB {
  tableName: string,
  foreignKeys?: RDBForeignkeys
}

interface RDBForeignkeys {
  test: string // TODO
}