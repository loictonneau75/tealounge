import * as utils from "./utils.js";
import * as dom_helpers from "./dom_helpers.js";
import * as TeaForm from "./form/tea_form.js";
import * as Carousel from "./visualisation/carousel.js";
import * as Cards from "./visualisation/cards.js"


/**
 * Initializes the page when the window finishes loading.
 * - Retrieves the configuration of the site.
 * - Sets the document title.
 * - Builds and appends the main page content to the body.
 *
 * @event window.onload
 */
window.onload = async () => {
    const config = await utils.getConfigValue();
    setupDoc(utils.snakeToTitleCase(config.siteName));
    document.body.append(await createPage(config));
    window.scroll(0, document.body.scrollHeight) //todo a retiré
};

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
function createPage(config){
    let lang = "fr"
    const h1 = dom_helpers.createCustomElement({tag: "h1", innerText: utils.toLineBreak(config.siteName), classList: ["text-center", "display-custom"]});
    const h2 = dom_helpers.createCustomElement({tag: "h2", innerText: utils.capitalize(`${config.UILabels[lang].yours} ${config.object[lang]}`), classList: ["h2"]});

    const formWrapper = dom_helpers.createCustomElement({tag: "div", classList: ["container", "bg-custom-primary", "p-5"]});
    formWrapper.append(h1, new TeaForm.TeaForm(lang, config));

    
    const carouselWrapper = dom_helpers.createCustomElement({tag: "div", classList: ["container", "bg-custom-primary", "p-5",]})
    carouselWrapper.append(h2, new Carousel.Carousel( new Cards.Cards(config)))
    window.addEventListener("resize", () => {
        carouselWrapper.innerHTML = ""
        carouselWrapper.append(h2, new Carousel.Carousel( new Cards.Cards(config)))
    })
    

    const MainWrapper = dom_helpers.createCustomElement({tag:"div"})
    MainWrapper.append(formWrapper, carouselWrapper);
    return MainWrapper;
};