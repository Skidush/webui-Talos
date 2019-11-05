import { $ } from 'protractor';
import { WebuiElement } from '../classes/classes.exports';
import { ElementUtil } from '../utils/utils.exports';

export enum DetailsPageElement {
  HEADER = 'webuilib-item-details h1',
  DETAIL_FIELD = 'webuilib-outcome-view webuilib-uuid-link[id="{ID}"]',
}
export class DetailsPage {
  static $detailField(fieldID: string): WebuiElement {
    return new WebuiElement($(ElementUtil.buildSelector(DetailsPageElement.DETAIL_FIELD, fieldID))); 
  }

  static get $detailsHeader(): WebuiElement {
    return new WebuiElement($(DetailsPageElement.HEADER));
  }
}