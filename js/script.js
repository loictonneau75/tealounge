import { getConfigValue, createCustomElement } from "./tools.js";
import { TeaForm } from "./tea_form.js";


function setupDoc(sitename){
    document.title = sitename;
};

async function createPage(title){
    const h1 = createCustomElement({tag: "h1", innerText: title, classList: ["text-center", "display-custom"]});
    const form = new TeaForm("fr");

    const formWrapper = createCustomElement({tag: "div", classList: ["container", "bg-custom-primary", "p-5", "my-5"]});
    formWrapper.append(h1, await form.build());

    const MainWrapper = document.createElement("div");
    MainWrapper.append(formWrapper);
    return MainWrapper;
};

window.onload = async () => {
    const sitename = await getConfigValue("siteName");
    setupDoc(sitename);
    document.body.append(await createPage(sitename));
};