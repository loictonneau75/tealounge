export async function getConfigValue(key) {
    try{
        const response = await fetch("../json/const.json");
        const data = await response.json();
        return data[key];
    } catch(error){
        console.error("Erreur lors de la récupération du JSON : ", error);
        return null
    }
};

function requiredParam(paramName){
    throw new Error(`l'Argument "${paramName}" est requis`);
};

export function createCustomElement({
    tag = requiredParam("name"), 
    innerText = null,
    classList = null}){
    const element = document.createElement(tag)
    
    if(innerText){element.innerText = innerText}
    
    element.classList.add(...(classList || []));

    return element;
};