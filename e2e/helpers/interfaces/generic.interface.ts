// TypeScript doesn't pprovide `JSON` as basic type
// https://github.com/Microsoft/TypeScript/issues/1897
export type JSONValue = any | JSObject | JSONArray;
export interface JSONArray extends Array<JSONValue>{};
export type JSObject = {
    [member: string]: JSONValue;
};

type ColumnValue = string | number;
export interface QueryCondition {
    [columnName: string]: ColumnValue;
}