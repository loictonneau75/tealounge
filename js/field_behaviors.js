import * as utils from "./utils.js";
import * as dom_helpers from "./dom_helpers.js"

export function oneChoice(wrapper, options, id, placeholder,  otherId, other){
    const input = dom_helpers.createCustomElement({tag: "input", id, type: "text", placeholder, classList: ["form-control"]});
    const innerWrapper = dom_helpers.createCustomElement({tag: "div", classList: ["position-relative"]});
    innerWrapper.appendChild(input);
    wrapper.appendChild(innerWrapper);
    if(options.length !== 0){
        input.readOnly = "readOnly"
        const suggestionWrapper = dom_helpers.createCustomElement({tag: "div", classList: ["list-group", "overflow-auto", "suggestion-scrollable"]})
        const button = dom_helpers.createCustomElement({tag: "div", classList: ["caret"]});
        const otherInput = dom_helpers.createCustomElement({tag: "input",id: otherId, type: "text", placeholder, classList: ["form-control", "d-none"]});
        setupDropdownHandler(input, [other, ...options], suggestionWrapper);
        setupKeyboard({input, wrapper: suggestionWrapper, otherInput, other});
        innerWrapper.appendChild(button)
        wrapper.append(innerWrapper, suggestionWrapper, otherInput);
    };
};

export function multipleChoice(wrapper, options, id, placeholder, choiceId, addLabel, other){
    const selectedChoices = [];
    const suggestionWrapper = dom_helpers.createCustomElement({tag: "div", classList: ["list-group", "overflow-auto", "suggestion-scrollable"]});
    const choiceWrapper = dom_helpers.createCustomElement({tag: "div", id: choiceId});
    const input = dom_helpers.createCustomElement({tag: "input",id, type: "text", placeholder, classList: ["form-control"]});
    const button = dom_helpers.createCustomElement({tag: "button", type: "button", textContent: addLabel, classList: ["btn", "btn-custom-secondary"]});
    const inputRow = dom_helpers.createCustomElement({tag: "div", classList: ["d-flex", "mb-2"]});
    inputRow.append(input, button);
    wrapper.append(inputRow, suggestionWrapper, choiceWrapper);
    setupAutocompleteListener(input, options, selectedChoices, suggestionWrapper)
    setupKeyboard({input, wrapper :suggestionWrapper, other})
    setupAddButton(button, selectedChoices, choiceWrapper, input, suggestionWrapper)
}


function setupKeyboard({input, wrapper, otherInput, other}){
    const state = { currentIndex: -1 };
    handleKeyboardNavigation(input, wrapper, otherInput, state, other)
    hideSuggestionsOnBlur(input, wrapper)
    handleSuggestionClick(input, wrapper, otherInput, state, other)
}


function handleKeyboardNavigation(input, wrapper, otherInput, state, other){
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
            event.preventDefault();
            state.currentIndex = (state.currentIndex - 1 + items.length) % items.length;
            items.forEach((it, i) => it.classList.toggle("bg-custom-secondary", i === state.currentIndex));
            items[state.currentIndex].scrollIntoView({block: "nearest"});
        } 
        
        else if (event.key === "Enter") {
            event.preventDefault();
            if (state.currentIndex >= 0) {finalizeSelection(input, wrapper, state, items[state.currentIndex].textContent, otherInput, other)}
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

function handleSuggestionClick(input, wrapper, otherInput, state, other){
    wrapper.addEventListener("click", event => {
        if (event.target.classList.contains("suggestion-item")) {
            finalizeSelection(input, wrapper, state, event.target.textContent, otherInput, other)
        }
    });
}

function finalizeSelection(input,wrapper, state, selected, otherInput, other){
    const isOtherSelected = selected === other;
    input.value = selected;
    wrapper.innerHTML = "";
    state.currentIndex = -1;
    if (otherInput) {
        otherInput.classList.toggle("d-none", !isOtherSelected);
    }
}

function setupDropdownHandler(input, options, suggestionsWrapper){
    input.addEventListener("click", () => {
        populateSuggestions(input, options, [], suggestionsWrapper);
    });
}

function setupAutocompleteListener(input, options,  selectedChoices, suggestionsWrapper){
    input.addEventListener("input", () => {
        const inputValue = input.value.trim();
        let filtered;
        suggestionsWrapper.innerHTML = "";
        if (!inputValue) {
            filtered = options.filter(ing => !selectedChoices.includes(ing));
        } else {
            filtered = options.filter(ing => ing.startsWith(utils.capitalize(inputValue)) && !selectedChoices.includes(ing));
        }
        populateSuggestions(input, filtered, selectedChoices, suggestionsWrapper);
    });
};

function populateSuggestions(input, options, selectedChoices = [], suggestionsWrapper) {
    const filtered = options.filter(opt => !selectedChoices.includes(opt));
    suggestionsWrapper.innerHTML = "";
    filtered.forEach(option => {
        const button = dom_helpers.createCustomElement({tag: "button", type: "button", textContent: option, classList: ["list-group-item", "list-group-item-action", "suggestion-item"]});
        button.addEventListener("click", () => {
            input.value = option;
            suggestionsWrapper.innerHTML = "";
        });
        suggestionsWrapper.appendChild(button);
    });
}

function displaySelectedChoices(selectedChoices, choiceContainer) {
    choiceContainer.innerHTML = "";
    selectedChoices.forEach((ingredient, index) => {
        const pill = dom_helpers.createCustomElement({tag: "span", textContent: ingredient, classList:["badge", "bg-custom-secondary", "rounded-pill"]})
        const closeBtn = dom_helpers.createCustomElement({tag: "button", type: "button", textContent: "×", classList: ["btn", "btn-outline-custom", "ms-2"]})
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
        const ingredient = input.value.trim();
        if (ingredient && !selectedChoices.includes(ingredient)) {
            selectedChoices.push(utils.capitalize(ingredient));
            displaySelectedChoices(selectedChoices, choiceWrapper, input);
        }
        input.value = "";
        suggestionsWrapper.innerHTML = "";
    });
}