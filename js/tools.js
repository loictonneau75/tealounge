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

function requiredParam(paramName){
    throw new Error(`l'Argument "${paramName}" est requis`);
};

export function createCustomElement({
    tag = requiredParam("name"), 
    innerText = null,
    classList = null,
    id = null,
    autocomplete = null,
    htmlFor = null,
    type = null,
    placeholder = null,
    required = null
}){
    const element = document.createElement(tag);
    
    if(innerText){element.innerText = innerText};
    
    element.classList.add(...(classList || []));

    if(id){element.id = id};

    if(autocomplete){element.autocomplete = autocomplete};

    if(htmlFor){element.htmlFor = htmlFor};

    if(type){element.type = type};

    if(placeholder){element.placeholder = placeholder};

    if(required){element.required = required}

    return element;
};

export function createRowWithColumns(contents){
    const row = createCustomElement({tag: "div",classList: ["row", "g-3"]});
    contents.forEach(content => {
        const col = createCustomElement({tag: "div", classList: `col-md-${Math.floor(12 / contents.length)}`});
        col.appendchild(content);
        row.appendChild(col);
    });
    return row;
};