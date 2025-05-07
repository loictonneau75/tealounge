import * as utils from "./utils.js";
import * as dom_helpers from "./dom_helpers.js";
import * as field_behaviors from "./field_behaviors.js";

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

    attachClearErrorListeners(inputElement, parent) {
        const clearError = () => {
            inputElement.classList.remove("missing-value")
            inputElement.removeEventListener("click", clearError);
            inputElement.removeEventListener("input", clearError);
        };
        inputElement.addEventListener("click", clearError);
        inputElement.addEventListener("input", clearError);
    }

    invalidateField(inputElement) {
        inputElement.classList.add("missing-value")
        this.attachClearErrorListeners(inputElement);
    }

    validateStandardField(input, required) {
        if (required && !input.value.trim()) {
            if (input) this.invalidateField(input);
            return { valid: false, value: null };
        }
        input.setCustomValidity("");
        return { valid: true, value: input.value.trim() };
    }

    validateChoiceField(input, choiceId, required) {
        const choiceContainer = document.getElementById(choiceId);
        if (required && (!choiceContainer || choiceContainer.children.length === 0)) {
            this.invalidateField(input);
            return { valid: false, value: null };
        }
        input.setCustomValidity("");
        if (choiceContainer && choiceContainer.children.length > 0){
            const selected = [...choiceContainer.children].map(child => child.firstChild.textContent.trim());
            return { valid: true, value: selected };
        }
        return { valid: true, value: null};
    }

    validateOtherField(input, otherId, required) {
        if (input.value.trim() !== this.UILabels.other) {return this.validateStandardField(input, required);}
        const otherInput = document.getElementById(otherId)
        const value = otherInput.value.trim()
        if (required && !value) {
            if (otherInput) this.invalidateField(otherInput);
            return { valid: false, value: null };
        }
        otherInput.setCustomValidity("");
        return { valid: true, value: null};
    }

    buildSubmitButton() {
        const submitBtn = dom_helpers.createCustomElement({tag: "button", type: "submit", textContent: this.UILabels.send, classList: ["btn", "btn-custom-secondary", "mt-3"]});
        submitBtn.addEventListener("click", async event => {
            event.preventDefault();
            let formValid = true
            const values = []
            const storageUpdates = [];
            const fieldMap = Object.assign({}, ...this.config.fields.map(row => ({ ...row })));
            Object.values(fieldMap).forEach(field => {
                const input = document.getElementById(field.id)
                let result
                if (input){
                    if (field.otherId){result = this.validateOtherField(input, field.otherId, field.required)}
                    else if (field.choiceId){result = this.validateChoiceField(input, field.choiceId, field.required)}
                    else{result = this.validateStandardField(input, field.required)}
                }
                if(!result.valid){formValid = false}
                else{
                    values.push({fieldname: field.label.en, value: result.value});
                    if (field.storageKey && result.value !== null) {
                        storageUpdates.push({ key: field.storageKey, value: result.value });
                    }
                }
            })
            if (formValid) {
                const dataToStore = {};
                values.forEach(({ fieldname, value }) => {dataToStore[fieldname] = value;});
                const key = await utils.getConfigValue("siteName");
                const existingData = JSON.parse(localStorage.getItem(key)) || [];
                const alreadyExists = existingData.some(item =>
                    JSON.stringify(item) === JSON.stringify(dataToStore)
                );
                if (!alreadyExists) {
                    existingData.push(dataToStore);
                    localStorage.setItem(key, JSON.stringify(existingData));
                }
                storageUpdates.forEach(({ key, value }) => {
                    const existing = JSON.parse(localStorage.getItem(key)) || [];
                    const newValues = Array.isArray(value) ? value : [value];
                    const merged = [...new Set([...existing, ...newValues])];
                    localStorage.setItem(key, JSON.stringify(merged));
                });
            }else{
                this.form.reportValidity()
            }
        });
        return submitBtn
    };


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
