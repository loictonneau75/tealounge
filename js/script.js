import { getConfigValue } from "./tools.js";


function setupDoc(sitename){
    document.title = sitename;
}

window.onload = () => {
    getConfigValue("siteName").then(sitename => {
        setupDoc(sitename);
    })
};