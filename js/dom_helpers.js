export function createCustomElement({tag = requiredParam("tag"), innerText = null, classList = [], id = null, autocomplete = null, htmlFor = null, type = null, placeholder = null, required = null, value = null, textContent = null, hidden = null, selected = null, readOnly = null}) {
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
        if (content.dataset.nbColumn){
            const innerRow = createCustomElement({tag: "div", classList: ["row", "g-3"]});
            for (let i  = 0; i < parseInt(content.dataset.nbColumn); i++){
                const innerCol = createCustomElement({tag: "div",classList: [`col-md-${Math.floor(12 / parseInt(content.dataset.nbColumn))}`]});
                if (i === 0){innerCol.appendChild(content)}
                innerRow.appendChild(innerCol)
            }
            col.appendChild(innerRow)
        }else{
            col.appendChild(content);
        }
        row.appendChild(col);
    });
    return row;
};

export function createInputField(id, innerText, placeholder, required){
    const label = createCustomElement({tag: "label", htmlFor: id, innerText, classList: ["form-label"]});
    const input = createCustomElement({tag: "input", id, type: "text", placeholder, classList: ["form-control"], required});
    const wrapper = createCustomElement({tag: "div", classList: ["form-group"]});
    wrapper.append(label, input);
    return wrapper;
};

export function createtextareaField(id, innerText, rows, required){
    const label = createCustomElement({tag: "label", htmlFor: id, innerText, classList: ["form-label"]});
    const input = createCustomElement({tag: "textarea", id, rows, classList: ["form-control"], required});
    const wrapper = createCustomElement({tag: "div", classList: ["form-group"]});
    wrapper.append(label, input);
    return wrapper;
}

export function createInputWithOptions(id, innerText, placeholder, callback, storageKey, otherId){
    const label = createCustomElement({tag: "label", htmlFor: id, innerText, classList: ["form-label"]});
    const option = getDataFromLocalStorage(storageKey);
    const wrapper = createCustomElement({tag: "div", classList: ["form-group", "position-relative"]});