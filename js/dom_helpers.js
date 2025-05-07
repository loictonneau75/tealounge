import * as utils from "./utils.js";
import * as storage from "./form/storage.js";


/**
 * Creates and returns a customized DOM element with various optional attributes.
 *
 * @function createCustomElement
 * @param {Object} options - Configuration options for the element.
 * @param {string} options.tag - The HTML tag name of the element (required).
 * @param {string} [options.innerText] - The innerText of the element.
 * @param {string[]} [options.classList] - An array of class names to add to the element.
 * @param {string} [options.id] - The ID to assign to the element.
 * @param {string} [options.autocomplete] - The autocomplete attribute.
 * @param {string} [options.htmlFor] - The htmlFor attribute (for labels).
 * @param {string} [options.type] - The type attribute (e.g., for inputs or buttons).
 * @param {string} [options.placeholder] - The placeholder text.
 * @param {string} [options.value] - The value of the element.
 * @param {string} [options.textContent] - The text content of the element.
 * @param {boolean} [options.hidden] - Whether the element is hidden.
 * @param {boolean} [options.selected] - Whether the element is selected.
 * @param {boolean} [options.readOnly] - Whether the element is read-only.
 * @returns {HTMLElement} The newly created and configured DOM element.
 * @throws {Error} If the `tag` parameter is not provided.
 */
export function createCustomElement({tag = utils.requiredParam("tag"), innerText = null, classList = [], id = null, autocomplete = null, htmlFor = null, type = null, placeholder = null, value = null, textContent = null, hidden = null, selected = null, readOnly = null}){
    const element = document.createElement(tag);
    if (classList.length) element.classList.add(...classList);
    for (const [key, val] of Object.entries(arguments[0])){
        if (!["tag", "classList"].includes(key) && val !== null && val !== undefined) element[key] = val;
    };
    return element;
};

/**
 * Creates an inner Bootstrap-style row with a specified number of columns .
 * The content is inserted into the first column.
 *
 * @function createInnerRow
 * @param {HTMLElement[]} contents - An array of DOM elements to be placed inside columns.
 * @param {string} nbOfColumn - The number of inner columns.
 * @returns {HTMLElement} A <div> element with the "row" class containing nested columns.
 */
function createInnerRow(content, nbColumn){
    const innerRow = createCustomElement({tag: "div", classList: ["row", "g-3"]});
    for (let i  = 0; i < parseInt(nbColumn); i++){
        const innerCol = createCustomElement({tag: "div",classList: [`col-md-${Math.floor(12 / parseInt(content.dataset.nbColumn))}`]});
        if (i === 0) innerCol.appendChild(content);
        innerRow.appendChild(innerCol);
    };
    return innerRow;
};

/**
 * Creates a Bootstrap-style row and fills it with columns based on the number of provided contents.
 * If a content element has a `data-nbColumn` attribute, it will generate a nested row using `createInnerRow`.
 *
 * @function createRowWithColumns
 * @param {HTMLElement[]} contents - An array of DOM elements to be placed inside columns.
 * @returns {HTMLElement} A <div> element with the "row" class containing the appropriate columns.
 */
export function createRowWithColumns(contents){
    const row = createCustomElement({tag: "div", classList: ["row", "g-3"]});
    contents.forEach(content => {
        const column = createCustomElement({tag: "div", classList: [`col-md-${Math.floor(12 / contents.length)}`]});
        if (content.dataset.nbColumn){
            const innerRow = createInnerRow(content, content.dataset.nbColumn);
            column.appendChild(innerRow);
        }else{column.appendChild(content)};
        row.appendChild(column);
    });
    return row;
};

/**
 * Creates a labeled text input field wrapped in a Bootstrap form group.
 *
 * @function createInputField
 * @param {string} id - The ID to assign to the input element and link it with the label.
 * @param {string} innerText - The text content of the label.
 * @param {string} placeholder - The placeholder text for the input field.
 * @returns {HTMLElement} A <div> element containing the label and input, styled as a Bootstrap form group.
 */
export function createInputField(id, innerText, placeholder){
    const label = createCustomElement({tag: "label", htmlFor: id, innerText, classList: ["form-label"]});
    const input = createCustomElement({tag: "input", id, type: "text", placeholder, classList: ["form-control"]});
    const wrapper = createCustomElement({tag: "div", classList: ["form-group"]});
    wrapper.append(label, input);
    return wrapper;
};

/**
 * Creates a labeled textarea field wrapped in a Bootstrap form group.
 *
 * @function createtextareaField
 * @param {string} id - The ID to assign to the textarea element and link it with the label.
 * @param {string} innerText - The text content of the label.
 * @param {number} rows - The number of visible text lines for the textarea.
 * @returns {HTMLElement} A <div> element containing the label and textarea, styled as a Bootstrap form group.
 */
export function createtextareaField(id, innerText, rows){
    const label = createCustomElement({tag: "label", htmlFor: id, innerText, classList: ["form-label"]});
    const input = createCustomElement({tag: "textarea", id, rows, classList: ["form-control"]});
    const wrapper = createCustomElement({tag: "div", classList: ["form-group"]});
    wrapper.append(label, input);
    return wrapper;
}

/**
 * Creates a labeled input field with dynamically injected options using a callback, optionally loading data from localStorage.
 *
 * @function createInputWithOptions
 * @param {string} id - The ID to assign to the input element and link it with the label.
 * @param {string} innerText - The text content of the label.
 * @param {string} placeholder - Placeholder text for the input field.
 * @param {Function} callback - A function that populates the input with additional content or behaviors.
 * @param {string} [storageKey] - A localStorage key used to retrieve data to populate options.
 * @param {string} [otherId] - An optional ID used when handling “other” input cases (e.g. for conditional logic inside the callback).
 * @returns {HTMLElement} A <div> element containing the customized input setup.
 */
export function createInputWithOptions(id, innerText, placeholder, callback, storageKey, otherId){
    const label = createCustomElement({tag: "label", htmlFor: id, innerText, classList: ["form-label"]});
    const option = storage.getDataFromLocalStorage(storageKey);
    const wrapper = createCustomElement({tag: "div", classList: ["form-group", "position-relative"]});
    wrapper.appendChild(label);
    callback(wrapper, option, id, placeholder, otherId);
    return wrapper;
};



