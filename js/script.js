import * as utils from "./utils/utils.js";
import * as dom_helpers from "./utils/dom_helpers.js";
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
    const storedLang = localStorage.getItem("lang") || "fr";

    setupDoc(utils.snakeToTitleCase(config.siteName));
    document.body.append(createPage(config, storedLang));
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
 * Assembles and returns the main page layout including language selection, form, and carousel.
 *
 * @function createPage
 * @param {Object} config - The site configuration object loaded at startup.
 * @param {string} lang - The current language code (e.g., "fr", "en").
 * @returns {HTMLElement} The main wrapper element containing all page sections.
 */
function createPage(config, lang){
    const flagDiv = chooseLang(config, lang);
    const { wrapper: formWrapper, form } = createForm(config, lang);
    const carouselWrapper = createCarousel(config, lang, form)
    const MainWrapper = dom_helpers.createCustomElement({tag:"div"})
    MainWrapper.append(flagDiv, formWrapper, carouselWrapper);
    return MainWrapper;
};

/**
 * Creates a wrapper containing the carousel section with a localized title.
 * Automatically re-renders the carousel on window resize.
 *
 * @function createCarousel
 * @param {Object} config - The configuration object containing UI labels and object names.
 * @param {string} lang - The selected language code for localization.
 * @returns {HTMLElement} A DOM element containing the carousel and its title.
 */
function createCarousel(config, lang, form){
    const title = dom_helpers.createCustomElement({tag: "h2", innerText: utils.capitalize(`${config.UILabels[lang].yours} ${config.object[lang]}`), classList: ["h2"]});
    const wrapper = dom_helpers.createCustomElement({tag: "div", classList: ["container", "bg-custom-primary", "p-5",]})
    wrapper.append(title, new Carousel.Carousel(new Cards.Cards(config, lang, form)))
    window.addEventListener("resize", () => {
        wrapper.innerHTML = ""
        wrapper.append(title, new Carousel.Carousel(new Cards.Cards(config, lang, form)))
    })
    return wrapper
}

/**
 * Creates a wrapper containing the main form section, including the title and the TeaForm instance.
 *
 * @function createForm
 * @param {Object} config - The configuration object providing form and UI data.
 * @param {string} lang - The selected language code for rendering the form in the correct language.
 * @returns {HTMLElement} A DOM element containing the form layout.
 */
function createForm(config, lang){
    const title = dom_helpers.createCustomElement({tag: "h1", innerText: utils.toLineBreak(config.siteName), classList: ["text-center", "display-custom"]});
    const wrapper = dom_helpers.createCustomElement({tag: "div", classList: ["container", "bg-custom-primary", "p-5"]});
    const form = new TeaForm.TeaForm(lang, config)
    wrapper.append(title, form.getForm());
    return {wrapper, form}
}

/**
 * Creates a language selector using flags and updates the language preference in localStorage.
 * Rebuilds the page in the selected language when a flag is clicked.
 *
 * @function chooseLang
 * @param {Object} config - The configuration object containing UI labels and flag paths for each language.
 * @returns {HTMLElement} A DOM element containing all language flags.
 */
function chooseLang(config){
    const div = dom_helpers.createCustomElement({tag:"div", classList: ["flag-container"]})
    for (const lang in config.UILabels){
        const flag = config.UILabels[lang].flag;
        const img = dom_helpers.createCustomElement({tag:"img", attributes: {src: flag, alt: lang, title: lang}, classList:["flag-icon"]})
        img.addEventListener("click", async () => {
            localStorage.setItem("lang", lang);
            document.body.innerHTML = "";
            document.body.append(createPage(config, lang));
        })
        div.appendChild(img)
    }
    return div
}