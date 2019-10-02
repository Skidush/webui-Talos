import { $ } from 'protractor';
import { WebuiElement } from '../classes/classes.exports';
import { ElementUtil } from '../utils/utils.exports';

export enum DetailsPageElement {
  DETAIL_FIELD = 'webuilib-outcome-view webuilib-uuid-link[id="{ID}"]',
}
export class DetailsPage {
  static $detailField(fieldID: string): WebuiElement {
    return new WebuiElement($(ElementUtil.buildSelector(DetailsPageElement.DETAIL_FIELD, fieldID))); 
  }
}