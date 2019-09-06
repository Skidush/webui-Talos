import { ToolbarAction, FormField, ShowsOn } from "../helper.exports";

export interface ItemConfig {
  readonly identifier: string,
  readonly summary: Array<ItemSummary>,
  readonly toolbarConfig: Toolbar,
  readonly schema: Array<SchemaField>,
  readonly tableConfig: Table,
  readonly detailsConfig: Details,
  readonly reportingDBConfig: ReportingDB,
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

type ToolbarActions = {
  [ToolbarAction.CREATE]: string, 
  [ToolbarAction.EDIT]: string, 
  [ToolbarAction.DELETE]: string, 
}

interface SchemaField {
  ID: string,
  caption: string,
  field: FormField
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