import * as domHelper from "../dom_helpers.js";
import * as storage from "../storage.js";
import * as utils from "../utils.js"
import * as Card from "./card.js"

export class Carrousel {
    constructor(config ,option = {slidesVisible: 3, slidetoScroll: 1}){
        this.div = domHelper.createCustomElement({tag: "div", classList: ["carrousel-container"]})
        this.config = config
        this.option = option
        this.fieldMap = utils.buildFieldMapFromGroups(this.config.fields)
    };

    build() {
        let cardDivList = []
        storage.getDataFromLocalStorage(this.config.object.en).forEach(object => {
            //todo rajouter le trieur ici
            const card = new Card.Card(object, this.fieldMap)
            const itemDiv = domHelper.createCustomElement({tag: "div", classList:["carrousel-item"]})
            itemDiv.appendChild(card.build())
            this.div.appendChild(itemDiv)
            cardDivList.push(itemDiv)
        });
        
        requestAnimationFrame(() => {
            let maxHeight = 0
            cardDivList.forEach(cardDiv => {
                cardDiv.style.width = ((1 / this.option.slidesVisible) * 100) + "%"
                cardDiv.style.height = "auto"
                if (cardDiv.offsetHeight > maxHeight) maxHeight = cardDiv.offsetHeight
            })
            cardDivList.forEach(card => {
                card.children[0].style.height = maxHeight + "px"
            })
        })

        return this.div
    }
};