import * as domHelper from "../dom_helpers.js";
import * as storage from "../storage.js";
import * as utils from "../utils.js"
import * as Card from "./card.js"

export class Carrousel {
    constructor(config ,option = {slidesVisible: 3, slidetoScroll: 1}){
        this.div = domHelper.createCustomElement({tag: "div"})
        this.config = config
        this.option = option
        this.fieldMap = utils.buildFieldMapFromGroups(this.config.fields)
    };

    build(){
        storage.getDataFromLocalStorage(this.config.object.en).forEach(object => {
            const card = new Card.Card(object, this.fieldMap)
            this.div.appendChild(card.build())
        });
        return this.div
    }
};