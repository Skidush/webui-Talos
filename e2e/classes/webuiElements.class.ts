import { ElementArrayFinder } from "protractor";
import { WebuiElement } from "./classes.exports";

export class WebuiElements {
    readonly $$elements: ElementArrayFinder;
    readonly timeout: number;
    constructor(elements: ElementArrayFinder) {
      this.$$elements = elements;
      this.timeout = this.$$elements.browser_.allScriptsTimeout;
    }
  
    /**
     * Retrieves the first matching element of the ElementArrayFinder
     * 
     * @returns the first element of the ElementArrayFinder as WebuiElement
     */
    first(): WebuiElement {
      return new WebuiElement(this.$$elements.first());
    }
  
    /**
     * Retrieves the last matching element of the ElementArrayFinder
     * 
     * @returns the last element of the ElementArrayFinder as WebuiElement
     */
    last(): WebuiElement {
      return new WebuiElement(this.$$elements.last());
    }
  
    /**
     * Retrieves the matching element based on the given index of the ElementArrayFinder
     * 
     * @param index the index of the element within the ElementArrayFinder
     * @returns a promise that will resolve to a WebuiElement
     */
    get(index: number): WebuiElement {
      return new WebuiElement(this.$$elements.get(index));
    }
  
    /**
     * Sends a request to get the innerText of the specified elements
     * 
     * @returns a promise representing the text extracted from the elements
     */
    async getText(): Promise<string> {
      return new WebuiElement(this.$$elements.first()).getText(this.$$elements);
    }
  }