import { createCustomElement, createRowWithColumns, getConfigValue} from "./tools.js";

export class TeaForm{
    constructor(){
        this.form = createCustomElement({tag: "form", autocomplete: "off"});
    };

    createInputField(id, labelText, required){
        const label = createCustomElement({tag: "label", htmlFor: id, innerText: labelText})
        const input = createCustomElement({tag: "input",id: id, type: "", placeholder: "text", classList: "form-control", required: required})
        const wrapper = createCustomElement({tag: "div", classList: "form-group"});
        wrapper.append(label, input);
        return wrapper
    };

    build(){
        this.form.append(this.createInputField()
            
        );
    };
};