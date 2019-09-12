import { isNullOrUndefined } from "util";
import * as _ from 'lodash';

import { DBConnection } from "../../project/configurations/dbConnection.conf";
import { JSONArray, JSONObject, QueryCondition, ItemSummary, ItemSummaryField } from "../helpers/helper.exports";

const db: DBConnection = new DBConnection();

export class ReportingDB {
  //TODO Change conditions to a type (Create condition type)
  static async getItem(tableName: string, columns: Array<string> | string = '*', conditions: any = `1 = 1`, limit: number = null): Promise<JSONObject | JSONArray> {
    const query = db.queryBuilder.select(columns).from(tableName).where(conditions);
    if (limit && limit > 0) {
      query.limit(limit);
      return await (await db.query(query)).rows;
    }
    return await (await db.query(query)).rows[0];
  }

  // TODO conditions seems wrong, change name and make it an explicit type
  static async parseToQueryConditions(conditions: JSONObject, itemSummary: Array<ItemSummary>, summaryField: ItemSummaryField): Promise<QueryCondition> {
    const queryCondition: QueryCondition = {};
    itemSummary.forEach(field => {
      if (isNullOrUndefined(field[summaryField]) || isNullOrUndefined(field[ItemSummaryField.DBCOLUMN])) {
        return;
      }
      
      const valueProperty = _.lowerCase(field[summaryField]);
      if (conditions.hasOwnProperty(valueProperty)){
        queryCondition[field[ItemSummaryField.DBCOLUMN]] = conditions[valueProperty];
      }
    });

    return queryCondition;
  }
}