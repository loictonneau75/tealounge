function attachClearErrorListeners(inputElement) {
    const clearError = () => {
        inputElement.classList.remove("missing-value")
        inputElement.removeEventListener("click", clearError);
        inputElement.removeEventListener("input", clearError);
    };
    inputElement.addEventListener("click", clearError);
    inputElement.addEventListener("input", clearError);
};

function invalidateField(inputElement) {
    inputElement.classList.add("missing-value")
    attachClearErrorListeners(inputElement);
}

export function validateStandardField(input, required) {
    if (required && !input.value.trim()) {
        if (input) invalidateField(input);
        return { valid: false, value: null };
    }
    input.setCustomValidity("");
    return { valid: true, value: input.value.trim() };
}

export function validateChoiceField(input, choiceId, required) {
    const choiceContainer = document.getElementById(choiceId);
    if (required && (!choiceContainer || choiceContainer.children.length === 0)) {
        invalidateField(input);
        return { valid: false, value: null };
    }
    input.setCustomValidity("");
    if (choiceContainer && choiceContainer.children.length > 0){
        const selected = [...choiceContainer.children].map(child => child.firstChild.textContent.trim());
        return { valid: true, value: selected };
    }
    return { valid: true, value: null};
}

export function validateOtherField(input, otherId, required, other) {
    if (input.value.trim() !== other) {return validateStandardField(input, required);}
    const otherInput = document.getElementById(otherId)
    const value = otherInput.value.trim()
    if (required && !value) {
        if (otherInput) invalidateField(otherInput);
        return { valid: false, value: null };
    }
    otherInput.setCustomValidity("");
    return { valid: true, value: null};
}