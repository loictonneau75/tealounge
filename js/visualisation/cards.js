import * as domHelper from "../dom_helpers.js";
import * as storage from "../storage.js";
import * as utils from "../utils.js"

/**
 * Class responsible for generating HTML cards from a configuration object
 * and data retrieved from localStorage.
 */
export class Cards {
    /**
     * Creates a new instance of the Cards class.
     * @param {Object} config - Configuration object used to build the cards.
     * @param {Object[]} config.fields - Array of field definitions grouped by section.
     * @param {Object} config.object - Object containing localization keys (e.g. `en`) for localStorage access.
     * @returns {HTMLElement[]} An array of generated card elements.
     */
    constructor(config){
        this.config = config;
        this.cards = [];
        this.fieldMap = utils.buildFieldMapFromGroups(this.config.fields);
        this.buildcard();
        return this.cards;
    };

    /**
     * Builds all card elements based on data from localStorage.
     * The cards are stored in the `this.cards` array.
     */
    buildcard(){
        storage.getDataFromLocalStorage(this.config.object.en).forEach(object => {
            const cardDiv = domHelper.createCustomElement({tag: "div"});
            const card = domHelper.createCustomElement({tag: "div", classList: ["card", "m-2"]});
            const sections = {
                header : this.buildSection("header", object),
                body: this.buildSection("body", object),
                footer: this.buildSection("footer", object),
            };
            Object.values(sections).forEach(section => {if (section.hasChildNodes()) card.appendChild(section)});
            cardDiv.appendChild(card);
            this.cards.push(cardDiv);
        });
    };

    /**
     * Builds a section (header, body, or footer) of the card based on object data.
     * @param {string} sectionName - The name of the section ("header", "body", or "footer").
     * @param {Object} object - The data object representing one item/card.
     * @returns {HTMLElement} The generated section element.
     */
    buildSection(sectionName, object) {
        const section = domHelper.createCustomElement({ tag: "div", classList: [`card-${sectionName}`] });
        for (const key in object) {
            const field = this.fieldMap[key.toLowerCase()];
            if (!field || field.cardPosition !== sectionName) continue;
            const element = this.buildElementForField(field, object[key]);
            section.appendChild(element);
        };
        return section;
    };

    /**
     * Builds an individual HTML element for a given field based on its role.
     * @param {Object} field - Field definition object with metadata such as `cardRole`.
     * @param {string|string[]} value - The value to display, which may be a string or array.
     * @returns {HTMLElement} The constructed element to insert into the card.
     */
    buildElementForField(field, value) {
        let tag;
        let classList;
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
