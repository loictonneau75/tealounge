import * as domHelper from "../dom_helpers.js";
import * as storage from "../storage.js";
import * as utils from "../utils.js"

export class Cards {
    constructor(config){
        this.config = config
        this.cards = []
        this.fieldMap = utils.buildFieldMapFromGroups(this.config.fields)
        this.buildcard()
        return this.cards
    }
    buildcard(){
        storage.getDataFromLocalStorage(this.config.object.en).forEach(object => {
            const cardDiv = domHelper.createCustomElement({tag: "div"})
            const card = domHelper.createCustomElement({tag: "div", classList: ["card", "m-2"]});
            const sections = {
                header : this.buildSection("header", object),
                body: this.buildSection("body", object),
                footer: this.buildSection("footer", object),
            };
            Object.values(sections).forEach(section => {if (section.hasChildNodes()) card.appendChild(section)});
            cardDiv.appendChild(card)
            this.cards.push(cardDiv)
        })
    }
    buildSection(sectionName, object) {
        const section = domHelper.createCustomElement({ tag: "div", classList: [`card-${sectionName}`] });
        for (const key in object) {
            const field = this.fieldMap[key.toLowerCase()];
            if (!field || field.cardPosition !== sectionName) continue;
            const element = this.buildElementForField(field, object[key]);
            section.appendChild(element);
        }
        return section;
    }

    buildElementForField(field, value) {
        let tag
        let classList
        if (field.cardRole === "title") {
            tag = "h5";
            classList = ["card-title"];
        } else if (field.cardRole === "subtitle") {
            tag = "h6";
            classList = ["card-subtitle", "text-muted"];
        } else {
            tag = "p";
            classList = ["card-text"];
        }
        const element = domHelper.createCustomElement({ tag, classList });
        element.textContent = Array.isArray(value) ? value.join(", ") : value;
        return element;
    }
}
