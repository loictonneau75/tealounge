import * as domHelpers from "../utils/dom_helpers.js";
import * as storage from "../utils/storage.js";
import * as utils from "../utils/utils.js"

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
     * @param {string} lang - The selected language code for localization.
     * 
     */
    constructor(config, lang, form){
        this.form = form
        this.config = config;
        this.lang = lang
        this.cards = [];
        this.fieldMap = utils.buildFieldMapFromGroups(this.config.fields);
        this.buildcard();
    };

    /**
     * Return an array of all cards
     * @returns {HTMLElement[]} An array of generated card elements.
     */
    getCards() {
        return this.cards;
    }

    /**
     * Builds all card elements based on data from localStorage.
     * The cards are stored in the `this.cards` array.
     */
    buildcard(){
        storage.getDataFromLocalStorage(this.config.object.en).forEach((object, index) => {
            const cardDiv = domHelpers.createCustomElement({tag: "div", classList: ["card-wrapper"]});
            const card = domHelpers.createCustomElement({tag: "div", classList: ["card", "m-2"], attributes: { "data-card-id": index }});
            const sections = {
                header : this.buildSection("header", object),
                body: this.buildSection("body", object),
                footer: this.buildSection("footer", object),
            };
            Object.values(sections).forEach(section => {card.appendChild(section)});
            this.buildActionButton(sections.footer)
            cardDiv.appendChild(card);
            this.cards.push(cardDiv);
        });
    };

    buildActionButton(footer){
        const deleteBtn = domHelpers.createCustomElement({tag: "button", innerText: this.config.UILabels[this.lang].delete, classList: ["btn", "btn-custom-secondary", "m-1", "btn-delete"]})
        const editBtn = domHelpers.createCustomElement({tag: "button", innerText: this.config.UILabels[this.lang].edit, classList: ["btn", "btn-custom-secondary", "m-1", "btn-edit"]})
        footer.append(deleteBtn, editBtn)
    }

    /**
     * Builds a section (header, body, or footer) of the card based on object data.
     * @param {string} sectionName - The name of the section ("header", "body", or "footer").
     * @param {Object} object - The data object representing one item/card.
     * @returns {HTMLElement} The generated section element.
     */
    buildSection(sectionName, object) {
        const section = domHelpers.createCustomElement({ tag: "div", classList: [`card-${sectionName}`] });
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
        const element = domHelpers.createCustomElement({ tag, classList });
        element.textContent = Array.isArray(value) ? value.join(", ") : value;
        return element;
    }

    setupSlidesActionButtonDelegation(carousel) {
        carousel.addEventListener("click", (e) => {
            const card = e.target.closest(".card");
            if (!card) return;
            const cardId = parseInt(card.dataset.cardId);
            const key = this.config.object.en;
            const teaToEdit = storage.getDataFromLocalStorage(key)[cardId];
            if (e.target.classList.contains("btn-edit")) {
                window.scrollTo({top: 0,behavior: "smooth"});
                this.form.prefillForm(teaToEdit, this.fieldMap)
                this.form.changeButton(key, cardId)
            } else if (e.target.classList.contains("btn-delete")) {
                storage.deleteDataByIndex(key, cardId);
                location.reload();
            }
        });
    }


}
