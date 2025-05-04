import * as utils from "./utils.js"
import * as dom_helpers from "./dom_helpers.js"
import { TeaForm } from "./tea_form.js";


function setupDoc(sitename){
    document.title = sitename;
};

async function createPage(title){
    const h1 = dom_helpers.createCustomElement({tag: "h1", innerText: title, classList: ["text-center", "display-custom"]});
    const form = new TeaForm("en");

    const formWrapper = dom_helpers.createCustomElement({tag: "div", classList: ["container", "bg-custom-primary", "p-5", "my-5"]});
    formWrapper.append(h1, await form.build());

    const MainWrapper = document.createElement("div");
    MainWrapper.append(formWrapper);
    return MainWrapper;
};

window.onload = async () => {
    const sitename = await utils.getConfigValue("siteName");
    setupDoc(utils.snakeToTitleCase(sitename));
    document.body.append(await createPage(utils.toLineBreak(sitename)));
};