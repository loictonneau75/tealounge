import * as tools from "./tools.js";

export class TeaForm{
    constructor(lang){
        this.lang = lang;
        this.form = tools.createCustomElement({tag: "form", autocomplete: "off"});
    };

    async build(){
        const formConfig = await tools.getConfigValue("form");
        const rows = []
        const fieldsrow = formConfig.fields;
        fieldsrow.forEach(fields => {
            const row = []
            for (const fieldName in fields){
                const field = fields[fieldName]
                const label = `${field.label[this.lang]} :`
                const placeholder = `${formConfig.UILabels[this.lang].inputPrefix} ${field.label[this.lang].toLowerCase()}`;
                if(field.otherId){
                    row.push(
                        tools.createInputWithOptions(
                            field.id, label, placeholder,
                            (wrapper, options, id, placeholder, otherId) => 
                                tools.oneChoice(wrapper, options, id, placeholder, otherId, field.required),
                            field.storageKey,field.otherId
                        )
                    )
                }else if(field.choiceId){
                    row.push(
                        tools.createInputWithOptions(
                            field.id, label,  placeholder, 
                            (wrapper, options, id, placeholder) => 
                                tools.multipleChoice(wrapper, options, id, placeholder, formConfig.UILabels[this.lang].add, field.required), 
                            field.storageKey
                        )
                    )
                }else if(field.textarea){
                    row.push(
                        tools.createtextareaField(field.id, label, field.textarea, field.required)
                    )
                }else{
                    row.push(
                        tools.createInputField(field.id, label, placeholder, field.required)
                    )
                }
            }
            rows.push(tools.createRowWithColumns(row))
        });
        this.form.append(...rows)
        return this.form
    };
};