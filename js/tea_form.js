import * as tools from "./tools.js";

export class TeaForm{
    constructor(lang){
        this.lang = lang;
        this.form = tools.createCustomElement({tag: "form", autocomplete: "off"});
    };

    async build(){
        const formConfig = await tools.getConfigValue("form");
        this.form.append(
            tools.createRowWithColumns([
                tools.createInputField(
                    formConfig.fields.name.id, 
                    `${formConfig.UILabels[this.lang].name} :`, 
                    `${formConfig.UILabels[this.lang].inputPrefix} ${formConfig.UILabels[this.lang].name.toLowerCase()}`, 
                    true
                ),
                tools.createInputWithOptions(
                    formConfig.fields.type.id, 
                    `${formConfig.UILabels[this.lang].type} :`, 
                    `${formConfig.UILabels[this.lang].inputPrefix} ${formConfig.UILabels[this.lang].type.toLowerCase()}`,
                    (wrapper, options, id, placeholder, required, otherId) => tools.oneChoice(wrapper, options, id, placeholder, required, otherId),
                    formConfig.fields.type.storageKey,
                    formConfig.fields.type.otherId
                )
            ]),
            tools.createRowWithColumns([
                tools.createInputWithOptions(
                    formConfig.fields.brand.id,
                    `${formConfig.UILabels[this.lang].brand} :`, 
                    `${formConfig.UILabels[this.lang].inputPrefix} ${formConfig.UILabels[this.lang].brand.toLowerCase()}`,
                    (wrapper, options, id, placeholder, required, otherId) => tools.oneChoice(wrapper, options, id, placeholder, required, otherId),
                    formConfig.fields.brand.storageKey,
                    formConfig.fields.brand.otherId
                ),
                tools.createInputWithOptions(
                    formConfig.fields.ingredient.id,
                    `${formConfig.UILabels[this.lang].ingredient} :`, 
                    `${formConfig.UILabels[this.lang].inputPrefix} ${formConfig.UILabels[this.lang].ingredient.toLowerCase()}`,
                    (wrapper, options, id, placeholder, required, otherId) => tools.multipleChoice(wrapper, options, id, placeholder, formConfig.UILabels[this.lang].add),
                    formConfig.fields.ingredient.storageKey,
                    formConfig.fields.ingredient.otherId
                )  
            ])
        );
        return this.form;
    };
};