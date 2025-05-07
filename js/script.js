import * as utils from "./utils.js";
import * as dom_helpers from "./dom_helpers.js";
import { TeaForm } from "./tea_form.js";


/**
 * Sets the document title to the given site name.
 *
 * @function setupDoc
 * @param {string} sitename - The name to assign to the document's title.
 */
function setupDoc(sitename){
    document.title = sitename;
};

/**
 * Asynchronously creates a page section containing a title and a built tea form.
 *
 * @async
 * @function createPage
 * @param {string} title - The title to display above the form.
 * @returns {Promise<HTMLElement>} A DOM element containing the full page layout with the form.
 */
async function createPage(title){
    const h1 = dom_helpers.createCustomElement({tag: "h1", innerText: title, classList: ["text-center", "display-custom"]});
    const form = new TeaForm("en");
    const formWrapper = dom_helpers.createCustomElement({tag: "div", classList: ["container", "bg-custom-primary", "p-5", "my-5"]});
    formWrapper.append(h1, await form.build());
    const MainWrapper = document.createElement("div");
    MainWrapper.append(formWrapper);
    return MainWrapper;
};

/**
 * Initializes the page when the window finishes loading.
 * - Retrieves the site name from configuration.
 * - Sets the document title.
 * - Builds and appends the main page content to the body.
 *
 * @event window.onload
 */
window.onload = async () => {
    const sitename = await utils.getConfigValue("siteName");
    setupDoc(utils.snakeToTitleCase(sitename));
    document.body.append(await createPage(utils.toLineBreak(sitename)));
};