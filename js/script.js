import { getConfigValue, createCustomElement } from "./tools.js";


function setupDoc(sitename){
    document.title = sitename;
};

function createPage(title){
    document.body.append(createCustomElement({tag: "h1", innerText: title, classList: ["text-center", "display-custom"]}))
    
};

window.onload = () => {
    getConfigValue("siteName").then(sitename => {
        setupDoc(sitename);
        createPage(sitename);
    })
    
};