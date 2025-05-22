import * as domHelper from "../dom_helpers.js";
import * as storage from "../storage.js";
import * as utils from "../utils.js"
import * as Card from "./card.js"

export class Carrousel {
    constructor(config ,option = {slidesVisible: 3, slidetoScroll: 1}){
        this.div = domHelper.createCustomElement({tag: "div", classList: ["carrousel-container"]})
        this.config = config
        this.option = option
        this.fieldMap = utils.buildFieldMapFromGroups(this.config.fields)
    };


    /**
     * Important ⚠️ : Toujours définir une valeur initiale de `flex` dans le CSS (SCSS)
     * avant de la modifier dynamiquement en JavaScript.
     *
     * Raison :
     * Le moteur de rendu du navigateur doit d’abord reconnaître les éléments comme
     * des "flex items" pour que les calculs de taille, d’alignement et de disposition
     * fonctionnent correctement. Si aucun `flex` n’est défini au départ, appliquer
     * `element.style.flex = ...` peut ne pas produire l’effet attendu ou casser le layout.
     *
     * Exemple :
     * En SCSS :
     *   .carrousel-item {
     *     flex: 0 0 auto; // Initialise le contexte flex
     *   }
     *
     * Puis en JS :
     *   itemDiv.style.flex = `0 0 calc(100% / ${slidesVisible})`; // Appliqué proprement
     */
    build() {
        let itemDivList = []
        storage.getDataFromLocalStorage(this.config.object.en).forEach(object => {
            //todo rajouter le trieur ici
            const card = new Card.Card(object, this.fieldMap)
            const itemDiv = domHelper.createCustomElement({tag: "div", classList:["carrousel-item"]})
            itemDiv.appendChild(card.build())
            this.div.appendChild(itemDiv)
            itemDivList.push(itemDiv)
        });
        
        requestAnimationFrame(() => {
            let maxHeight = 0
            itemDivList.forEach(cardDiv => {
                cardDiv.style.flex = `0 0 ${(100/this.option.slidesVisible)}%`
                cardDiv.style.height = "auto"
                if (cardDiv.offsetHeight > maxHeight) maxHeight = cardDiv.offsetHeight
            })
            itemDivList.forEach(card => {
                card.children[0].style.height = maxHeight + "px"
            })
        })

        return this.div
    }
};