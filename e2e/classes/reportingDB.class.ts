import { isNullOrUndefined } from "util";
import * as _ from 'lodash';

import { DBConnection } from "../../project/configurations/dbConnection.conf";
import { JSONArray, JSObject, QueryCondition, ItemSummary, ItemSummaryField, ReportingDB as RDB } from "../helpers/helper.exports";

const db: DBConnection = new DBConnection();

export class ReportingDB {
  //TODO Change conditions to a type (Create condition type)
  static async getItem(
    tableName: string, columns: Array<string> | string = '*', conditions: any = `1 = 1`, 
    orderBy: Array<string> = null, limit: number = null): Promise<JSObject | JSONArray> {
    const query = db.queryBuilder.select(columns).from(tableName).where(conditions);
    orderBy && query.orderBy(orderBy[0], orderBy[1]);    
    if (limit && limit > 0) {
      query.limit(limit);
      return (await db.query(query)).rows;
    }
    return (await db.query(query)).rows[0];
  }

  static async parseToQueryConditions(conditions: JSObject, itemSummary: Array<ItemSummary>, summaryField: ItemSummaryField, rdbConfig: RDB): Promise<QueryCondition> {
    const queryCondition: QueryCondition = {};
    for (const field of itemSummary) {
      if (isNullOrUndefined(field[summaryField]) || isNullOrUndefined(field[ItemSummaryField.DBCOLUMN])) {
        continue;
      }
      const schemaID = field[ItemSummaryField.SCHEMA_ID] ? field[ItemSummaryField.SCHEMA_ID].toUpperCase() : null;
      const foundProperty = conditions ? conditions.find(value => value.ID.toUpperCase() === schemaID) : null;
      if (foundProperty) {
        let fk = rdbConfig.foreignKeys;
        queryCondition[field[ItemSummaryField.DBCOLUMN]] = foundProperty.value;
        if (fk && Object.keys(fk).includes(field[ItemSummaryField.DBCOLUMN])) {
          fk = rdbConfig.foreignKeys[field[ItemSummaryField.DBCOLUMN]];
          const condition = {};
          condition[fk['column']] = foundProperty.value;
          queryCondition[field[ItemSummaryField.DBCOLUMN]] = (await this.getItem(fk['table'], 'UUID', condition))['UUID'];
        }
      }
    };

    return queryCondition;
  }
}