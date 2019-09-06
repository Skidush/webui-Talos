// TypeScript doesn't pprovide `JSON` as basic type
// https://github.com/Microsoft/TypeScript/issues/1897
export type JSONValue = any | JSONObject | JSONArray;

// Constructor name will be Array
export interface JSONArray extends Array<JSONValue>{};

// Constructor name will be Object
export type JSONObject = {
    [member: string]: JSONValue 
};

type ColumnValue = string | number

export interface QueryCondition {
    [columnName: string]: ColumnValue
}