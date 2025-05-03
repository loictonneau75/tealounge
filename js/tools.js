export async function getConfigValue(key) {
    try{
        const response = await fetch("../json/const.json");
        const data = await response.json();
        return data[key];
    } catch(error){
        console.error("Erreur lors de la récupération du JSON : ", error);
        return null;
    }
};

function getDataFromLocalStorage(storageKey){
    const rawData = localStorage.getItem(storageKey);
    try{
        return rawData ? JSON.parse(rawData) : [];
    }catch(e){
        console.error("Erreur de parsing JSON: ", e);
        return [];
    };
};

function capitalize(s){
    return String(s[0]).toUpperCase() + String(s).slice(1);
}

function finalizeSelection(input,wrapper, state, selected, otherInput){
    const isOtherSelected = selected === "autre";
    input.value = selected;
    wrapper.innerHTML = "";
    state.currentIndex = -1;
    if (otherInput) {
        otherInput.classList.toggle("d-none", !isOtherSelected);
        otherInput.required = isOtherSelected;
    }
}

function handleKeyboardNavigation(input, wrapper, otherInput,state){
    input.addEventListener("keydown", event => {
        const items = wrapper.querySelectorAll(".suggestion-item");
        if (!items.length) {return};

        if (event.key === "ArrowDown") {
            event.preventDefault();
            state.currentIndex = (state.currentIndex + 1) % items.length;
            items.forEach((it, i) => it.classList.toggle("bg-custom-secondary", i === state.currentIndex));
            items[state.currentIndex].scrollIntoView({block: "nearest"});
        } 
        
        else if (event.key === "ArrowUp") {
            //todo ai-je besoin des preventDefault
            event.preventDefault();
            state.currentIndex = (state.currentIndex - 1 + items.length) % items.length;
            items.forEach((it, i) => it.classList.toggle("bg-custom-secondary", i === state.currentIndex));
            items[state.currentIndex].scrollIntoView({block: "nearest"});
        } 
        
        else if (event.key === "Enter") {
            event.preventDefault();
            if (state.currentIndex >= 0) {finalizeSelection(input, wrapper, state, items[state.currentIndex].textContent, otherInput)}
        } 
        
        else if (event.key === "Escape") {
            input.blur();
            state.currentIndex = -1;
        }
    });
}

function hideSuggestionsOnBlur(input, wrapper){
    input.addEventListener("blur", () => {
        setTimeout(() => {wrapper.innerHTML = "";}, 250);
    });
}

function handleSuggestionClick(input, wrapper, otherInput, state){
    wrapper.addEventListener("click", event => {
        if (event.target.classList.contains("suggestion-item")) {
            finalizeSelection(input, wrapper, state, event.target.textContent, otherInput)
        }
    });
}

function setupKeyboard({input, wrapper, otherInput}){
    const state = { currentIndex: -1 };
    handleKeyboardNavigation(input, wrapper, otherInput, state)
    hideSuggestionsOnBlur(input, wrapper)
    handleSuggestionClick(input, wrapper, otherInput, state)

}

function requiredParam(paramName){
    throw new Error(`l'Argument "${paramName}" est requis`);
};

export function createCustomElement({
    // todo reduire ceci
    tag = requiredParam("tag"),
    innerText = null,
    classList = [],
    id = null,
    autocomplete = null,
    htmlFor = null,
    type = null,
    placeholder = null,
    required = null,
    value = null,
    textContent = null,
    hidden = null,
    selected = null,
    readOnly = null
}) {
    const element = document.createElement(tag);
    if (classList.length) {element.classList.add(...classList);}

    for (const [key, val] of Object.entries(arguments[0])) {
        if (!["tag", "classList"].includes(key) && val !== null && val !== undefined) {
            element[key] = val;
        }
    }
    return element;
}

export function createRowWithColumns(contents){
    const row = createCustomElement({tag: "div", classList: ["row", "g-3"]});
    contents.forEach(content => {
        const col = createCustomElement({tag: "div", classList: [`col-md-${Math.floor(12 / contents.length)}`]});
        col.appendChild(content);
        row.appendChild(col);
    });
    return row;
};

export function createInputField(id, innerText, placeholder, required){
    const label = createCustomElement({tag: "label", htmlFor: id, innerText, classList: ["form-label"]});
    const input = createCustomElement({tag: "input", id, type: "", placeholder, classList: ["form-control"], required});
    const wrapper = createCustomElement({tag: "div", classList: ["form-group"]});
    wrapper.append(label, input);
    return wrapper;
};

function populateSuggestions(input, options, selectedChoices = [], suggestionsWrapper) {
    const filtered = options.filter(opt => !selectedChoices.includes(opt));
    suggestionsWrapper.innerHTML = "";
    filtered.forEach(option => {
        const button = createCustomElement({tag: "button", type: "button", textContent: option, classList: ["list-group-item", "list-group-item-action", "suggestion-item"]});
        button.addEventListener("click", () => {
            input.value = option;
            suggestionsWrapper.innerHTML = "";
        });
        suggestionsWrapper.appendChild(button);
    });
}

function setupDropdownHandler(input, options, suggestionsWrapper){
    input.addEventListener("click", () => {
        populateSuggestions(input, options, [], suggestionsWrapper);
    });
}

export function oneChoice(wrapper, options, id, placeholder, required, otherId){

    const input = createCustomElement({tag: "input", id, placeholder, classList: ["form-control"], required});
    wrapper.appendChild(input);
    if(options.length !== 0){
        const suggestionWrapper = createCustomElement({tag: "div", classList: ["list-group", "overflow-auto", "suggestion-scrollable"]})
        const button = createCustomElement({tag: "div", classList: ["caret"]});
        const otherInput = createCustomElement({tag: "input",id: otherId, placeholder, classList: ["form-control", "d-none"], required});
        input.readOnly = "readOnly"
        setupDropdownHandler(input, ["autre", ...options], suggestionWrapper);
        setupKeyboard({input, wrapper:suggestionWrapper, otherInput});
        wrapper.append(button, suggestionWrapper, otherInput);
    };
};

function setupAutocompleteListener(input, options,  selectedChoices, suggestionsWrapper){
    input.addEventListener("input", () => {
        const inputValue = input.value.trim();
        let filtered;
        suggestionsWrapper.innerHTML = "";
        if (!inputValue) {
            filtered = options.filter(ing => !selectedChoices.includes(ing));
        } else {
            filtered = options.filter(ing => ing.startsWith(capitalize(inputValue)) && !selectedChoices.includes(ing));
        }
        populateSuggestions(input, filtered, selectedChoices, suggestionsWrapper);
    });
};

function createIngredientPill(ingredient, onRemove){
    const pill = createCustomElement({tag: "span", textContent: ingredient, classList:["badge", "bg-custom-secondary", "rounded-pill"]})
    const closeBtn = createCustomElement({tag: "button", type: "button", textContent: "×", classList: ["btn", "btn-outline-danger"]})
    closeBtn.addEventListener('click', onRemove);
    pill.appendChild(closeBtn);
    return pill
};

function displaySelectedChoices(selectedChoices, choiceContainer) {
    choiceContainer.innerHTML = "";
    selectedChoices.forEach((ingredient, index) => {
        const pill = createCustomElement({tag: "span", textContent: ingredient, classList:["badge", "bg-custom-secondary", "rounded-pill"]})
        const closeBtn = createCustomElement({tag: "button", type: "button", textContent: "×", classList: ["btn", "btn-outline-custom-danger"]})
        closeBtn.addEventListener('click', () => {
            selectedChoices.splice(index, 1);
            displaySelectedChoices(selectedChoices, choiceContainer);
        });
        pill.appendChild(closeBtn);
        choiceContainer.appendChild(pill);
    });
};

function setupAddButton(button, selectedChoices, choiceWrapper, input, suggestionsWrapper){
    button.addEventListener("click", () =>{
        console.log("[DEBUG] Bouton cliqué")
        const ingredient = input.value.trim();
        if (ingredient && !selectedChoices.includes(ingredient)) {
            selectedChoices.push(capitalize(ingredient));
            displaySelectedChoices(selectedChoices, choiceWrapper);
        }
        input.value = "";
        suggestionsWrapper.innerHTML = "";
    });
}

export function multipleChoice(wrapper, options, id, placeholder, addLabel){
    const selectedChoices = [];
    const suggestionWrapper = createCustomElement({tag: "div", classList: ["list-group", "overflow-auto", "suggestion-scrollable"]});
    const choiceWrapper = createCustomElement({tag: "div"});
    const input = createCustomElement({tag: "input", id, placeholder, classList: ["form-control"]});
    const button = createCustomElement({tag: "button", type: "button", textContent: addLabel, classList: ["btn", "btn-custom-secondary"]});
    const inputRow = createCustomElement({tag: "div", classList: ["d-flex", "mb-2"]});
    inputRow.append(input, button);
    wrapper.append(inputRow, suggestionWrapper, choiceWrapper);
    setupAutocompleteListener(input, options, selectedChoices, suggestionWrapper)
    setupKeyboard({input, wrapper :suggestionWrapper})
    setupAddButton(button, selectedChoices, choiceWrapper, input, suggestionWrapper)

}

export function createInputWithOptions(id, innerText, placeholder,callback, storageKey, otherId, required){
    const label = createCustomElement({tag: "label", htmlFor: id, innerText, classList: ["form-label"]});
    const option = getDataFromLocalStorage(storageKey);
    const wrapper = createCustomElement({tag: "div", classList: ["form-group", "position-relative"]});
    wrapper.appendChild(label);
    callback(wrapper, option, id, placeholder, required, otherId);
    return wrapper;
};