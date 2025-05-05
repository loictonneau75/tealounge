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
            return dom_helpers.createInputWithOptions(field.id, labelText, placeholder,(wrapper, options, id, placeholder, otherId) => field_behaviors.oneChoice(wrapper, options, id, placeholder, otherId, this.UILabels.other, field.required),field.storageKey, field.otherId);
        } else if (field.choiceId) {
            return dom_helpers.createInputWithOptions(field.id, labelText, placeholder,(wrapper, options, id, placeholder) => field_behaviors.multipleChoice(wrapper, options, id, placeholder, field.choiceId, this.UILabels.add, this.UILabels.other, field.required), field.storageKey);
        } else if (field.textarea) {
            return dom_helpers.createtextareaField(field.id, labelText, field.textarea, field.required);
        } else {
            return dom_helpers.createInputField(field.id, labelText, placeholder, field.required);
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

    attachClearErrorListeners(inputElement) {
        const clearError = () => {
            inputElement.setCustomValidity("");
            inputElement.removeEventListener("click", clearError);
            inputElement.removeEventListener("input", clearError);
        };
        inputElement.addEventListener("click", clearError);
        inputElement.addEventListener("input", clearError);
    }
    

    invalidateField(inputElement) {
        inputElement.setCustomValidity(this.UILabels.errormsg);
        this.attachClearErrorListeners(inputElement);
    }

    validateStandardField(field) {
        const inputElement = document.getElementById(field.id);
        if (!inputElement || !inputElement.value.trim()) {
            if (inputElement) this.invalidateField(inputElement);
            return { valid: false, value: null };
        }
        inputElement.setCustomValidity("");
        return { valid: true, value: inputElement.value.trim() };
    }

    validateChoiceField(field) {
        const inputElement = document.getElementById(field.id);
        const choiceContainer = document.getElementById(field.choiceId);
        if (!choiceContainer || choiceContainer.children.length === 0) {
            if (inputElement) this.invalidateField(inputElement);
            return { valid: false, value: null };
        }
        inputElement?.setCustomValidity("");
        const selected = [...choiceContainer.children].map(child => child.textContent.trim());
        return { valid: true, value: selected };
    }

    validateOtherField(field) {
        const inputElement = document.getElementById(field.id);
        const otherInput = document.getElementById(field.otherId);
        if (inputElement?.value.trim() !== this.UILabels.other) {return this.validateStandardField(field);}
        if (!otherInput || !otherInput.value.trim()) {
            if (otherInput) this.invalidateField(otherInput);
            return { valid: false, value: null };
        }
        otherInput.setCustomValidity("");
        return { valid: true, value: otherInput.value.trim() };
    }

    validateFields() {
        let isValid = true;
        const values = [];
        this.config.fields.forEach(fields => {
            Object.values(fields).forEach(field => {
                let result;
                if (field.required) {
                    if (field.choiceId) {result = this.validateChoiceField(field)} 
                    else if (field.otherId) { result = this.validateOtherField(field)} 
                    else {result = this.validateStandardField(field);}
                } else {
                    const input = document.getElementById(field.id);
                    if (input?.value.trim()) {result = { valid: true, value: input.value.trim()}}
                }
                if (result) {
                    isValid = isValid && result.valid;
                    if (result.valid) {values.push({ id: field.id, value: result.value })}
                }
            });
        });
        return { isValid, values };
    }

    buildSubmitButton() {
        const btn = dom_helpers.createCustomElement({tag: "button", type: "submit", textContent: this.UILabels.send, classList: ["btn", "btn-custom-secondary", "mt-3"]});
        btn.addEventListener("click", e => {
            e.preventDefault();
            const { isValid, values } = this.validateFields();
            if (this.form.checkValidity() && isValid) {
                console.log(values);
                this.resetForm();
            } else {
                this.form.reportValidity();
            }
        });
        return dom_helpers.createRowWithColumns([btn]);
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
