/**
 * Attaches event listeners to an input element to clear visual error indicators (e.g. a "missing-value" class)
 * when the user interacts with the field (clicks or types).
 *
 * @function attachClearErrorListeners
 * @param {HTMLInputElement} inputElement - The input element to monitor and clear error styles from.
 */
function attachClearErrorListeners(inputElement){
    const clearError = () => {
        inputElement.classList.remove("missing-value");
        inputElement.removeEventListener("click", clearError);
        inputElement.removeEventListener("input", clearError);
    };
    inputElement.addEventListener("click", clearError);
    inputElement.addEventListener("input", clearError);
};

/**
 * Marks an input field as invalid by adding a visual error class and setting up listeners to clear it upon user interaction.
 *
 * @function invalidateField
 * @param {HTMLInputElement} inputElement - The input element to mark as invalid.
 */
function invalidateField(inputElement){
    inputElement.classList.add("missing-value");
    attachClearErrorListeners(inputElement);
};

/**
 * Validates a standard text input field by checking if it meets the required condition.
 * Marks the field as invalid if empty and required, and clears custom validity otherwise.
 *
 * @function validateStandardField
 * @param {HTMLInputElement} input - The input element to validate.
 * @param {boolean} required - Whether the field is required to have a value.
 * @returns {{ valid: boolean, value: string|null }} An object indicating if the input is valid and its trimmed value.
 */
export function validateStandardField(input, required){
    if (required && !input.value.trim()){
        if (input) invalidateField(input);
        return { valid: false, value: null };
    }
    input.setCustomValidity("");
    return { valid: true, value: input.value.trim() };
};

/**
 * Validates a choice-based input by checking if any choices have been selected.
 * Marks the input as invalid if required and no choices are present.
 *
 * @function validateChoiceField
 * @param {HTMLInputElement} input - The input element associated with the choices.
 * @param {string} choiceId - The ID of the container holding the selected choices.
 * @param {boolean} required - Whether at least one choice is required.
 * @returns {{ valid: boolean, value: string[]|null }} An object indicating validity and the selected choices if available.
 */
export function validateChoiceField(input, choiceId, required){
    const choiceContainer = document.getElementById(choiceId);
    if (required && (!choiceContainer || choiceContainer.children.length === 0)){
        invalidateField(input);
        return { valid: false, value: null };
    };
    input.setCustomValidity("");
    if (choiceContainer && choiceContainer.children.length > 0){
        const selected = [...choiceContainer.children].map(child => child.firstChild.textContent.trim());
        return { valid: true, value: selected };
    };
    return {valid: true, value: null};
}

/**
 * Validates an input that may reference an "other" field for custom values.
 * If the input matches the "other" keyword, validates the linked `otherId` field instead.
 *
 * @function validateOtherField
 * @param {HTMLInputElement} input - The main input element to check.
 * @param {string} otherId - The ID of the additional input field for custom "other" values.
 * @param {boolean} required - Whether the field is required.
 * @param {string} other - The keyword indicating that the "other" input should be used instead.
 * @returns {{ valid: boolean, value: string|null }} An object indicating validity and the extracted value, if valid.
 */
export function validateOtherField(input, otherId, required, other){
    if (input.value.trim() !== other){return validateStandardField(input, required)};
    const otherInput = document.getElementById(otherId);
    const value = otherInput.value.trim();
    if (required && !value){
        if (otherInput) invalidateField(otherInput);
        return {valid: false, value: null};
    };
    otherInput.setCustomValidity("");
    return {valid: true, value: null};
};