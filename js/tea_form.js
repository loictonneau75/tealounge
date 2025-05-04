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
        console.log(formConfig.UILabels[this.lang].send)
        const submitBtn = tools.createCustomElement({tag: "button", type:"submit", textContent: formConfig.UILabels[this.lang].send, classList: ["btn", "btn-custom-secondary"]})
        submitBtn.addEventListener("click", e => {
            e.preventDefault();
            console.log("click")
        });
        rows.push(tools.createRowWithColumns([submitBtn]))
        this.form.append(...rows)
        return this.form
        
        submitBtn.addEventListener("click", e => {
            e.preventDefault();
            
            const pillsContainer = document.getElementById("ok"); // id défini dans multipleChoice()
            const pills = Array.from(pillsContainer.querySelectorAll(".badge"))
                .map(p => p.firstChild.textContent.trim());
        
            // Exemple de contrôle manuel (si nécessaire en plus du MutationObserver)
            const ingredientInput = pillsContainer.previousSibling.querySelector("input");
            if (pills.length === 0 && ingredientInput) {
                ingredientInput.setCustomValidity("Veuillez ajouter au moins 1 ingrédient.");
            } else if (ingredientInput) {
                ingredientInput.setCustomValidity("");
            }
        
            // Validation HTML5
            if (this.form.checkValidity()) {
                console.log("Formulaire valide ✅");
                this.form.reset();
                // (Optionnel) vider les chips manuellement :
                if (pillsContainer) pillsContainer.innerHTML = "";
            } else {
                console.log("Formulaire invalide ❌");
                this.form.reportValidity();
            }
        });
        
        
        
    };
};