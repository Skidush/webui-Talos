import { by, element } from 'protractor';
import { WebuiElement, GetElementBy } from '../helpers/helper.exports';
import { ElementUtil } from '../utils/element.utils';

export enum DetailsPageElement {
  DETAIL_FIELD = 'webuilib-outcome-view webuilib-uuid-link[id="{ID}"]',
}
export class DetailsPage {

    // private static detailsPanel(itemName: string) {
    //     return GetElement.byXPath('//webuilib-outcome-view/div/div/p-panel[@ng-reflect-header="' + itemName + '"]');
    // }

    static _detailField(fieldID: string): Promise<WebuiElement> {
      return GetElementBy.elementFinder(element(by.css(ElementUtil.buildSelector(DetailsPageElement.DETAIL_FIELD, fieldID))));
    }
}