import * as dom_helpers from "../utils/dom_helpers.js";
import * as field_behaviors from "./field_behaviors.js";
import * as validator from "./validator.js";
import * as storage from "../utils/storage.js";

/**
 * TeaForm dynamically builds and manages a localized tea form interface.
 * It supports different field types (standard, multiple choice, "other", textarea), handles validation, and stores user input.
 *
 * @class TeaForm
 */
export class TeaForm {
    /**
     * Initializes a new instance of TeaForm for the specified language.
     *
     * @constructor
     * @param {string} lang - The language code used to localize labels and placeholders.
     */
    constructor(lang, config){ //todo changer le jsdoc
        this.lang = lang;
        this.object = config.object.en
        this.fields = config.fields;
        this.UILabels = config.UILabels[this.lang];
        this.form = dom_helpers.createCustomElement({ tag: "form", autocomplete: "off" });
        this.buildForm()
        return this.form;
    };

    buildForm(){
        const rows = this.fields.map(fields => this.buildFieldRow(fields));
        rows.push(this.buildSubmitButton());
        this.form.append(...rows);
    }


    /**
     * Builds a row of fields and wraps them in Bootstrap columns.
     *
     * @param {Object[]} fields - An array of field configuration objects to display in the row.
     * @returns {HTMLElement} A DOM element representing the row of fields.
     */
    buildFieldRow(fields){
        const row = [];
        Object.values(fields).forEach(field => {
            const element = this.buildField(field);
            if (field.nbColumn) element.dataset.nbColumn = field.nbColumn;
            row.push(element);
        });
        return dom_helpers.createRowWithColumns(row);
    };

    /**
     * Builds a form field based on its configuration, choosing the appropriate input type and label.
     *
     * @param {Object} field - The field configuration object.
     * @returns {HTMLElement} A DOM element representing the constructed field.
     */
    buildField(field){
        const label = field.label[this.lang];
        const placeholder = `${this.UILabels.inputPrefix} ${label.toLowerCase()}`;
        const labelText = `${label} :`;
        if (field.otherId) return dom_helpers.createInputWithOptions(field.id, labelText, placeholder,(wrapper, options, id, placeholder, otherId) => field_behaviors.oneChoice(wrapper, options, id, placeholder, otherId, this.UILabels.other),field.storageKey, field.otherId);
        else if (field.choiceId) return dom_helpers.createInputWithOptions(field.id, labelText, placeholder,(wrapper, options, id, placeholder) => field_behaviors.multipleChoice(wrapper, options, id, placeholder, field.choiceId, this.UILabels.add, this.UILabels.other), field.storageKey);
        else if (field.textarea) return dom_helpers.createtextareaField(field.id, labelText, field.textarea);
        else return dom_helpers.createInputField(field.id, labelText, placeholder);
    };

    /**
     * Creates the form's submit button and attaches a listener to validate and store the data.
     *
     * @returns {HTMLButtonElement} A configured submit button element.
     */
    buildSubmitButton(){
        const submitBtn = dom_helpers.createCustomElement({tag: "button", type: "submit", textContent: this.UILabels.send, classList: ["btn", "btn-custom-secondary", "mt-3"]});
        submitBtn.addEventListener("click", async event => {
            event.preventDefault();
            const {isValid, values, storageUpdates} = this.collectAndValidateFormFields();
            if (!isValid){
                this.form.reportValidity();
                return;
            };
            await storage.storeDataIfNew(storage.structureDataToStore(values), this.object);
            storage.updateLocalStorage(storageUpdates);
            this.resetForm();
        });
        return submitBtn;
    };

    /**
     * Validates all form fields, collects their values, and prepares updates for localStorage.
     *
     * @returns {{ isValid: boolean, values: Array<{fieldname: string, value: any}>, storageUpdates: Array<{key: string, value: any}> }}
     */
    collectAndValidateFormFields(){
        let formValid = true; 
        const values = [];
        const storageUpdates = [];
        const fieldMap = Object.assign({}, ...this.fields.map(row => ({ ...row })));
        Object.values(fieldMap).forEach(field => {
            const input = document.getElementById(field.id);
            let result;
            if (input){
                if (field.otherId) result = validator.validateOtherField(input, field.otherId, field.required, this.UILabels.other);
                else if (field.choiceId) result = validator.validateChoiceField(input, field.choiceId, field.required);
                else result = validator.validateStandardField(input, field.required);
                if (!result.valid) formValid = false;
                else {
                    values.push({ fieldname: field.label.en, value: result.value });
                    if (field.storageKey && result.value !== null) storageUpdates.push({ key: field.storageKey, value: result.value });
                };
            };
        });
        return { isValid: formValid, values, storageUpdates };
    };

    /**
     * Resets the form inputs and removes badges or readonly values.
     */
    resetForm(){
        this.form.reset();
        this.form.querySelectorAll(".badge, .chip").forEach(el => el.remove());
        this.form.querySelectorAll("input[readonly]").forEach(input => {input.value = ""});
    };
};