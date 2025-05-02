import { getConfigValue, createCustomElement } from "./tools.js";
import { TeaForm } from "./tea_form.js";


function setupDoc(sitename){
    document.title = sitename;
};

function createPage(title){
    const h1 = createCustomElement({tag: "h1", innerText: title, classList: ["text-center", "display-custom"]});
    const form = new TeaForm();

    const formWrapper = createCustomElement({tag: "div", classList: ["container", "bg-secondcolor", "p-5", "my-5"]});
    formWrapper.append(h1, form);

    const MainWrapper = document.createElement("div");
    MainWrapper.append(formWrapper);
    return MainWrapper;
};

window.onload = () => {
    getConfigValue("siteName").then(sitename => {
        setupDoc(sitename);
        document.body.append(createPage(sitename));
    });
};