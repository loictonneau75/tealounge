import * as domHelper from "../dom_helpers.js";

export class Card {
    constructor(data, fieldMap){
        this.fieldMap = fieldMap
        this.data = data
    }

    build(){
        const card = domHelper.createCustomElement({tag: "div", classList: ["card", "m-2"]});
        const sections = {
            header : this.buildSection("header"),
            body: this.buildSection("body"),
            footer: this.buildSection("footer"),
        };
        Object.values(sections).forEach(section => {if (section.hasChildNodes()) card.appendChild(section)});
        return card
    }

    buildSection(sectionName) {
        const section = domHelper.createCustomElement({ tag: "div", classList: [`card-${sectionName}`] });
        for (const key in this.data) {
            const field = this.fieldMap[key];
            if (!field || field.cardPosition !== sectionName) continue;
            const element = this.buildElementForField(field, this.data[key]);
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