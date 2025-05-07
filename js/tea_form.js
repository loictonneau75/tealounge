import * as utils from "./utils.js";
import * as dom_helpers from "./dom_helpers.js";
import * as field_behaviors from "./field_behaviors.js";
import * as validator from "./validator.js"
import * as storage from "./storage.js"

export class TeaForm {
    constructor(lang) {
        this.lang = lang;
        this.form = dom_helpers.createCustomElement({ tag: "form", autocomplete: "off" });
        this.config = null;
        this.UILabels = null;
    }

    buildField(field) {
        const label = field.label[this.lang];
        const placeholder = `${this.UILabels.inputPrefix} ${label.toLowerCase()}`;
        const labelText = `${label} :`;
        if (field.otherId) {
            return dom_helpers.createInputWithOptions(field.id, labelText, placeholder,(wrapper, options, id, placeholder, otherId) => field_behaviors.oneChoice(wrapper, options, id, placeholder, otherId, this.UILabels.other),field.storageKey, field.otherId);
        } else if (field.choiceId) {
            return dom_helpers.createInputWithOptions(field.id, labelText, placeholder,(wrapper, options, id, placeholder) => field_behaviors.multipleChoice(wrapper, options, id, placeholder, field.choiceId, this.UILabels.add, this.UILabels.other), field.storageKey);
        } else if (field.textarea) {
            return dom_helpers.createtextareaField(field.id, labelText, field.textarea);
        } else {
            return dom_helpers.createInputField(field.id, labelText, placeholder);
        }
    }

    buildFieldRow(fields) {
        const row = [];
        Object.values(fields).forEach(field => {
            const element = this.buildField(field);
            if (field.nbColumn) {element.dataset.nbColumn = field.nbColumn}
            
            row.push(element);
        });
        return dom_helpers.createRowWithColumns(row);
    }

    resetForm() {
        this.form.reset();
        this.form.querySelectorAll(".badge, .chip").forEach(el => el.remove());
        this.form.querySelectorAll("input[readonly]").forEach(input => {input.value = ""});
    };

    buildSubmitButton() {
        const submitBtn = dom_helpers.createCustomElement({
            tag: "button",
            type: "submit",
            textContent: this.UILabels.send,
            classList: ["btn", "btn-custom-secondary", "mt-3"]
        });
    
        submitBtn.addEventListener("click", async event => {
            event.preventDefault();
    
            const { isValid, values, storageUpdates } = this.collectAndValidateFormFields();
            if (!isValid) {
                this.form.reportValidity();
                return;
            }
    
            const dataToStore = storage.structureDataToStore(values);
            await storage.storeDataIfNew(dataToStore);
            storage.updateLocalStorage(storageUpdates);
    
            this.resetForm();
        });
    
        return submitBtn;
    }
    

    collectAndValidateFormFields() {
        let formValid = true; 
        const values = [];
        const storageUpdates = [];
        const fieldMap = Object.assign({}, ...this.config.fields.map(row => ({ ...row })));
        Object.values(fieldMap).forEach(field => {
            const input = document.getElementById(field.id);
            let result;
            if (input) {
                if (field.otherId) {result = validator.validateOtherField(input, field.otherId, field.required, this.UILabels.other)} 
                else if (field.choiceId) {result = validator.validateChoiceField(input, field.choiceId, field.required)} 
                else {result = validator.validateStandardField(input, field.required);}
                if (!result.valid) {formValid = false} 
                else {
                    values.push({ fieldname: field.label.en, value: result.value });
                    if (field.storageKey && result.value !== null) {storageUpdates.push({ key: field.storageKey, value: result.value })}
                }
            }
        });
        return { isValid: formValid, values, storageUpdates };
    }

    async build() {
        const { config, UILabels } = await utils.loadFormConfig(this.lang);
        this.config = config;
        this.UILabels = UILabels;
        const rows = this.config.fields.map(fields => this.buildFieldRow(fields));
        rows.push(this.buildSubmitButton());
        this.form.append(...rows);
        return this.form;
    }
}
