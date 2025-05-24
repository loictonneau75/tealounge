import * as utils from "../utils/utils.js";
import * as dom_helpers from "../utils/dom_helpers.js";


/**
 * Creates a single-choice input field with a dropdown suggestion list and optional "other" input field.
 *
 * @function oneChoice
 * @param {HTMLElement} wrapper - The parent container where the input and suggestions will be appended.
 * @param {string[]} options - The list of suggested options to display in the dropdown.
 * @param {string} id - The ID to assign to the input element.
 * @param {string} placeholder - The placeholder text for the input.
 * @param {string} otherId - The ID for the additional "other" input field.
 * @param {string} other - The label or keyword used to trigger the display of the "other" input.
 */
export function oneChoice(wrapper, options, id, placeholder,  otherId, other){
    const input = dom_helpers.createCustomElement({tag: "input", id, type: "text", placeholder, classList: ["form-control"]});
    const innerWrapper = dom_helpers.createCustomElement({tag: "div", classList: ["position-relative"]});
    innerWrapper.appendChild(input);
    wrapper.appendChild(innerWrapper);
    if(options.length !== 0){
        input.readOnly = "readOnly";
        const suggestionWrapper = dom_helpers.createCustomElement({tag: "div", classList: ["list-group", "overflow-auto", "suggestion-scrollable"]});
        const button = dom_helpers.createCustomElement({tag: "div", classList: ["caret"]});
        const otherInput = dom_helpers.createCustomElement({tag: "input",id: otherId, type: "text", placeholder, classList: ["form-control", "d-none"]});
        setupDropdownHandler(input, [other, ...options], suggestionWrapper);
        setupKeyboard({input, wrapper: suggestionWrapper, otherInput, other});
        innerWrapper.appendChild(button);
        wrapper.append(innerWrapper, suggestionWrapper, otherInput);
    };
};

/**
 * Creates a multiple-choice input interface with autocomplete suggestions and a list of selected choices.
 *
 * @function multipleChoice
 * @param {HTMLElement} wrapper - The parent container where the input, suggestions, and selected choices will be rendered.
 * @param {string[]} options - The list of suggestions for the input autocomplete.
 * @param {string} id - The ID to assign to the main input field.
 * @param {string} placeholder - The placeholder text for the input field.
 * @param {string} choiceId - The ID for the container that will hold the selected choices.
 * @param {string} addLabel - The label text for the "Add" button.
 * @param {string} other - A special keyword to trigger additional input behavior (e.g. handling "other" values).
 */
export function multipleChoice(wrapper, options, id, placeholder, choiceId, addLabel, other){
    const selectedChoices = [];
    const suggestionWrapper = dom_helpers.createCustomElement({tag: "div", classList: ["list-group", "overflow-auto", "suggestion-scrollable"]});
    const choiceWrapper = dom_helpers.createCustomElement({tag: "div", id: choiceId});
    const input = dom_helpers.createCustomElement({tag: "input",id, type: "text", placeholder, classList: ["form-control"]});
    const button = dom_helpers.createCustomElement({tag: "button", type: "button", textContent: addLabel, classList: ["btn", "btn-custom-secondary"]});
    const inputRow = dom_helpers.createCustomElement({tag: "div", classList: ["d-flex", "mb-2"]});
    inputRow.append(input, button);
    wrapper.append(inputRow, suggestionWrapper, choiceWrapper);
    setupAutocompleteListener(input, options, selectedChoices, suggestionWrapper);
    setupKeyboard({input, wrapper :suggestionWrapper, other});
    setupAddButton(button, selectedChoices, choiceWrapper, input, suggestionWrapper);
};

/**
 * Attaches a click event listener to an input element to display suggestion options in a dropdown.
 *
 * @function setupDropdownHandler
 * @param {HTMLInputElement} input - The input field that triggers the suggestion dropdown on click.
 * @param {string[]} options - The list of options to display as suggestions.
 * @param {HTMLElement} suggestionsWrapper - The container element where suggestions will be rendered.
 */
function setupDropdownHandler(input, options, suggestionsWrapper){
    input.addEventListener("click", () => {populateSuggestions(input, options, [], suggestionsWrapper)});
};

/**
 * Sets up an input event listener to filter and display autocomplete suggestions as the user types.
 *
 * @function setupAutocompleteListener
 * @param {HTMLInputElement} input - The input element to attach the listener to.
 * @param {string[]} options - The full list of possible suggestions.
 * @param {string[]} selectedChoices - The list of already selected options to exclude from suggestions.
 * @param {HTMLElement} suggestionsWrapper - The container where filtered suggestions will be displayed.
 */
function setupAutocompleteListener(input, options,  selectedChoices, suggestionsWrapper){
    input.addEventListener("input", () => {
        const inputValue = input.value.trim();
        let filtered;
        suggestionsWrapper.innerHTML = "";
        if (!inputValue) filtered = options.filter(ing => !selectedChoices.includes(ing))
        else filtered = options.filter(ing => ing.startsWith(utils.capitalize(inputValue)) && !selectedChoices.includes(ing));
        populateSuggestions(input, filtered, selectedChoices, suggestionsWrapper);
    });
};

/**
 * Sets up keyboard navigation and interaction for a suggestion-based input field.
 *
 * @function setupKeyboard
 * @param {Object} params - An object containing configuration parameters.
 * @param {HTMLInputElement} params.input - The input element to bind keyboard events to.
 * @param {HTMLElement} params.wrapper - The container element holding the suggestion list.
 * @param {HTMLInputElement} [params.otherInput] - An optional input field for "other" values.
 * @param {string} [params.other] - An optional keyword that triggers the "other" input behavior.
 */
function setupKeyboard({input, wrapper, otherInput, other}){
    const state = { currentIndex: -1 };
    handleKeyboardNavigation(input, wrapper, otherInput, state, other);
    hideSuggestionsOnlosedFocus(input, wrapper);
    handleSuggestionClick(input, wrapper, otherInput, state, other);
};

/**
 * Sets up the "Add" button to append a new choice to the selected list and display it as a badge.
 * Clears the input and suggestion list after adding.
 *
 * @function setupAddButton
 * @param {HTMLButtonElement} button - The button element that triggers the addition.
 * @param {string[]} selectedChoices - The array storing currently selected items.
 * @param {HTMLElement} choiceWrapper - The container where selected items (badges) will be displayed.
 * @param {HTMLInputElement} input - The input field from which the value is taken.
 * @param {HTMLElement} suggestionsWrapper - The container holding the suggestion list, to be cleared after adding.
 */
function setupAddButton(button, selectedChoices, choiceWrapper, input, suggestionsWrapper){
    button.addEventListener("click", () =>{
        const ingredient = input.value.trim();
        if (ingredient && !selectedChoices.includes(ingredient)){
            selectedChoices.push(utils.capitalize(ingredient));
            displaySelectedChoices(selectedChoices, choiceWrapper, input);
        };
        input.value = "";
        suggestionsWrapper.innerHTML = "";
    });
};

/**
 * Enables keyboard navigation for a suggestion list associated with an input field.
 * Supports ArrowDown, ArrowUp, Enter, and Escape keys.
 *
 * @function handleKeyboardNavigation
 * @param {HTMLInputElement} input - The input element to monitor for keyboard events.
 * @param {HTMLElement} wrapper - The container holding the suggestion items.
 * @param {HTMLInputElement} [otherInput] - Optional input for custom "other" values.
 * @param {Object} state - An object tracking the currently selected index in the suggestion list.
 * @param {string} [other] - Optional keyword to trigger special behavior for "other" values.
 */
function handleKeyboardNavigation(input, wrapper, otherInput, state, other){
    input.addEventListener("keydown", event => {
        const items = wrapper.querySelectorAll(".suggestion-item");
        if (!items.length) return;
        if (event.key === "ArrowDown"){
            event.preventDefault();
            state.currentIndex = (state.currentIndex + 1) % items.length;
            items.forEach((it, i) => it.classList.toggle("bg-custom-secondary", i === state.currentIndex));
            items[state.currentIndex].scrollIntoView({block: "nearest"});
        } else if (event.key === "ArrowUp"){
            event.preventDefault();
            state.currentIndex = (state.currentIndex - 1 + items.length) % items.length;
            items.forEach((it, i) => it.classList.toggle("bg-custom-secondary", i === state.currentIndex));
            items[state.currentIndex].scrollIntoView({block: "nearest"});
        } else if (event.key === "Enter"){
            event.preventDefault();
            if (state.currentIndex >= 0){finalizeSelection(input, wrapper, state, items[state.currentIndex].textContent, otherInput, other)}
        } else if (event.key === "Escape"){
            input.blur();
            state.currentIndex = -1;
        };
    });
};

/**
 * Populates the suggestion dropdown with options not already selected, and sets up click behavior to fill the input.
 *
 * @function populateSuggestions
 * @param {HTMLInputElement} input - The input element to update when a suggestion is selected.
 * @param {string[]} options - The list of all available options.
 * @param {string[]} [selectedChoices=[]] - An optional array of already selected values to exclude.
 * @param {HTMLElement} suggestionsWrapper - The container where the suggestion buttons will be rendered.
 */
function populateSuggestions(input, options, selectedChoices = [], suggestionsWrapper){
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
};

/**
 * Clears the suggestion list shortly after the input field loses focus.
 *
 * @function hideSuggestionsOnlosedFocus
 * @param {HTMLInputElement} input - The input element to watch for the blur event.
 * @param {HTMLElement} wrapper - The container holding the suggestion items to be cleared.
 */
function hideSuggestionsOnlosedFocus(input, wrapper){
    input.addEventListener("blur", () => {setTimeout(() => {wrapper.innerHTML = "";}, 250)});
};

/**
 * Handles click events on suggestion items, finalizing the selection when one is clicked.
 *
 * @function handleSuggestionClick
 * @param {HTMLInputElement} input - The input field to update with the selected value.
 * @param {HTMLElement} wrapper - The container holding the suggestion items.
 * @param {HTMLInputElement} [otherInput] - Optional input for custom "other" values.
 * @param {Object} state - An object tracking the current suggestion selection index.
 * @param {string} [other] - Optional keyword to trigger special behavior for "other" values.
 */
function handleSuggestionClick(input, wrapper, otherInput, state, other){
    wrapper.addEventListener("click", event => {
        if (event.target.classList.contains("suggestion-item")) finalizeSelection(input, wrapper, state, event.target.textContent, otherInput, other);
    });
};

/**
 * Finalizes the user's selection from the suggestion list and updates the input field.
 * Clears the suggestion list and handles the visibility of an optional "other" input field.
 *
 * @function finalizeSelection
 * @param {HTMLInputElement} input - The input element to set with the selected value.
 * @param {HTMLElement} wrapper - The container holding the suggestion items, to be cleared.
 * @param {Object} state - An object tracking the current selection index.
 * @param {string} selected - The text content of the selected suggestion.
 * @param {HTMLInputElement} [otherInput] - Optional input field for custom "other" values.
 * @param {string} [other] - Keyword indicating the "other" option that triggers the visibility of the `otherInput`.
 */
function finalizeSelection(input,wrapper, state, selected, otherInput, other){
    const isOtherSelected = selected === other;
    input.value = selected;
    wrapper.innerHTML = "";
    state.currentIndex = -1;
    if (otherInput) otherInput.classList.toggle("d-none", !isOtherSelected);
};

/**
 * Displays selected choices as removable badge elements inside a container.
 * Each badge includes a close button that removes the corresponding choice when clicked.
 *
 * @function displaySelectedChoices
 * @param {string[]} selectedChoices - The array of selected items to display.
 * @param {HTMLElement} choiceContainer - The container in which the badges will be rendered.
 */
export function displaySelectedChoices(selectedChoices, choiceContainer){
    choiceContainer.innerHTML = "";
    selectedChoices.forEach((ingredient, index) => {
        const pill = dom_helpers.createCustomElement({tag: "span", textContent: ingredient, classList:["badge", "bg-custom-secondary", "rounded-pill"]});
        const closeBtn = dom_helpers.createCustomElement({tag: "button", type: "button", textContent: "×", classList: ["btn", "btn-outline-custom", "ms-2"]});
        closeBtn.addEventListener('click', () => {
            selectedChoices.splice(index, 1);
            displaySelectedChoices(selectedChoices, choiceContainer);
        });
        pill.appendChild(closeBtn);
        choiceContainer.appendChild(pill);
    });
};