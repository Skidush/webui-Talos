import { isNullOrUndefined } from "util";
import * as _ from 'lodash';

import { pgConnection } from "../../configurations/pgCon.conf";
import { JSONArray, JSONObject, QueryCondition } from "../helpers/interfaces/generic.interface";
import { ItemSummary, ItemSummaryField } from "../helpers/interfaces/item.interface";

const pg: pgConnection = new pgConnection();

export class ReportingDB {
  //TODO Change conditions to a type (Create condition type)
  static async getItem(tableName: string, columns: Array<string> | string = '*', conditions: any = `1 = 1`, limit: number = null): Promise<JSONObject | JSONArray> {
    const query = pg.queryBuilder.select(columns).from(tableName).where(conditions);
    if (limit && limit > 0) {
      query.limit(limit);
      return await (await pg.query(query)).rows;
    }
    return await (await pg.query(query)).rows[0];
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