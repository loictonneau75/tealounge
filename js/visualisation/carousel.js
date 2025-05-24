import * as domHelpers from "../utils/dom_helpers.js";
import * as storage from "../utils/storage.js"

/**
 * A responsive and optionally infinite carousel with pagination and navigation controls.
 */
export class Carousel{
    /**
     * Initializes a new carousel instance.
     * @param {HTMLElement[]} slides - The list of slide elements , better if the element are individualy in a div.
     * @param {Object} [options] - Configuration options for the carousel.
     * @param {number} [options.slidesToScroll=1] - Number of slides to scroll per interaction.
     * @param {number} [options.slidesVisible=3] - Number of visible slides at once.
     * @param {boolean} [options.loop=false] - Whether to loop when reaching the ends.
     * @param {boolean} [options.slideIndicator=true] - Whether to show pagination indicators.
     * @param {boolean} [options.infinite=true] - Whether to enable infinite scrolling.
     * @throws {Error} If both `loop` and `infinite` are true.
     * @returns {HTMLElement} The outer carousel wrapper element.
     */
    //todo changer le jsdoc
    constructor(cardInstance, options = {slidesToScroll: 1, slidesVisible: 3, loop: false, slideIndicator: true, infinite: true}) {
        this.cardInstance = cardInstance
        this.options = options;
        this.slides = cardInstance.getCards();
        this.currentSlide = 0;
        this.moveCallBacks = [];
        this.offset = 0;
        this.isMobile = false;
        this.slideIndicatorButtons = [];
        this.validateAndAdjustOptions();
        this.initDOM();
        if (this.options.infinite) this.setupInfiniteScroll();
        this.track.append(...this.slides);
        this.cardInstance.setupSlidesActionButtonDelegation(this.track);
        this.setStyle();
        this.createNavigation();
        if (this.options.slideIndicator) this.createSlideIndicator();
        this.moveCallBacks.forEach(callback => callback(this.currentSlide));
        this.onWindowResize();
        window.addEventListener("resize", this.onWindowResize.bind(this));
        return this.wrapper;
    }

    /**
     * Validate and adjust the carousel options based on the number of slides and exclusivity rules.
     */
    validateAndAdjustOptions(){
        if (this.options.loop && this.options.infinite) throw new Error("A carousel can't be in loop mode and infinite mode at the same time.");
        if (this.options.infinite && (this.slides.length <= this.options.slidesVisible -1)){
            this.options.slideIndicator = false;
            this.options.infinite = false
        }
        if (this.options.loop && (this.slides.length <= this.options.slidesVisible)){
            this.options.slideIndicator = false;
            this.options.loop = false
        }
    }

    /**
     * Creates the DOM structure for the carousel: wrapper, viewport, container and track.
     */
    initDOM() {
        this.wrapper = domHelpers.createCustomElement({tag: "div", classList: ["_carousel-wrapper"]});
        this.track = domHelpers.createCustomElement({tag: "div", classList: ["_carousel-track"]});
        this.carousel = domHelpers.createCustomElement({tag: "div", classList: ["_carousel"]});
        this.viewport = domHelpers.createCustomElement({tag: "div", classList: ["_carousel-viewport"]});
        this.carousel.appendChild(this.track);
        this.viewport.appendChild(this.carousel);
        this.wrapper.appendChild(this.viewport);
    }

    /**
     * Prepares infinite scrolling by cloning slides at the beginning and end.
     */
    setupInfiniteScroll() {
        this.offset = this.options.slidesVisible + this.options.slidesToScroll - 1;
        this.slides = [
            ...this.slides.slice(this.slides.length - this.offset).map(slide => slide.cloneNode(true)),
            ...this.slides,
            ...this.slides.slice(0, this.offset).map(slide => slide.cloneNode(true))
        ];
        this.goToSlide(this.offset, false);
        this.track.addEventListener("transitionend", this.resetInfinite.bind(this));
    }

    /**
     * Applies styles and dimensions to all slides based on the current configuration.
     */
    setStyle(){
        let ratio = this.slides.length / this.slidesVisible;
        this.track.style.width = (ratio * 100) + "%";
        this.slides.forEach(slide => {
            slide.classList.add("_carousel-slide")
            slide.style.width = ((100 / this.slidesVisible) / ratio) + "%"
        });
        this.adjustHeight();
        
    };

    /**
     * Adjusts the height of all slides to match the tallest one for layout consistency.
     */
    adjustHeight(){
        let maxHeight = 0;
        requestAnimationFrame(() => {
            this.slides.forEach(slide => {if (slide.offsetHeight > maxHeight) maxHeight = slide.offsetHeight});
            this.slides.forEach(slide => {slide.children[0].style.height = maxHeight+"px"});
        });
    };

    /**
     * Creates navigation buttons (next/prev) and adds click listeners.
     */
    createNavigation(){
        let nextButton = domHelpers.createCustomElement({tag: "div", classList:["_carousel-next"]});
        let prevButton = domHelpers.createCustomElement({tag: "div", classList:["_carousel-prev"]});
        this.wrapper.append(nextButton, prevButton);
        nextButton.addEventListener("click", this.next.bind(this));
        prevButton.addEventListener("click", this.prev.bind(this));
        if(this.options.loop === false){ this.onMove(index => {
            prevButton.classList.toggle("_carousel-prev-hidden", index === 0);
            nextButton.classList.toggle("_carousel-next-hidden", this.slides[this.currentSlide + this.slidesVisible] === undefined)
        })}
    };

    /**
     * Initializes pagination indicators based on the number of real slides.
     */
    createSlideIndicator() {
        const offset = this.options.infinite ? this.offset : 0;
        const totalSlides = this.slides.length - (this.options.infinite ? 2 * this.offset : 0);
        const maxStartIndex = totalSlides - this.options.slidesVisible;
        const slideIndicator = domHelpers.createCustomElement({tag: "div",classList: ["_carousel-slide-indicator"]});
        this.wrapper.appendChild(slideIndicator);
        this.generatePaginationButtons(slideIndicator, offset, maxStartIndex);
        this.activatePaginationOnMove(offset, totalSlides);
    }

    /**
     * Creates pagination buttons and appends them to the indicator container.
     * @param {HTMLElement} container - The pagination container.
     * @param {number} offset - The offset to apply to each pagination jump.
     * @param {number} maxStartIndex - The highest valid index for a page.
     */
    generatePaginationButtons(container, offset, maxStartIndex) {
        for (let i = 0; i <= maxStartIndex; i += this.options.slidesToScroll) {
            const button = domHelpers.createCustomElement({
                tag: "div",
                classList: ["_carousel-slide-indicator-button"]
            });
            button.addEventListener("click", () => this.goToSlide(i + offset));
            container.appendChild(button);
            this.slideIndicatorButtons.push(button);
        }
    }

    /**
     * Activates the correct pagination button based on current index.
     * @param {number} offset - Offset applied to real slides when infinite.
     * @param {number} count - Total number of real slides.
     */
    activatePaginationOnMove(offset, count) {
        this.onMove(index => {
            const realIndex = (index - offset + count) % count;
            const buttonIndex = Math.floor(realIndex / this.options.slidesToScroll);
            const activeButton = this.slideIndicatorButtons[buttonIndex];
            if (activeButton) {
                this.slideIndicatorButtons.forEach(button =>
                    button.classList.remove("_carousel-slide-indicator-button-active")
                );
                activeButton.classList.add("_carousel-slide-indicator-button-active");
            }
        });
    }

    /**
     * Moves the carousel forward by `slidesToScroll`.
     */
    next(){
        this.goToSlide(this.currentSlide + this.slidesToScroll);
    };

    /**
     * Moves the carousel backward by `slidesToScroll`.
     */
    prev(){
        this.goToSlide(this.currentSlide - this.slidesToScroll);
    };

    /**
     * Scrolls to a specific slide in the track.
     * @param {number} index - The index of the slide to scroll to.
     * @param {boolean} [animation=true] - Whether to animate the transition.
     */
    goToSlide(index, animation = true){
        const isBeyondEnd = index > this.slides.length;
        const noMoreVisibleSlides = this.slides[this.currentSlide + this.slidesVisible] === undefined;
        const isScrollingForward = index > this.currentSlide;
        if (index <0) index = this.slides.length - this.slidesVisible;
        else if (isBeyondEnd || (noMoreVisibleSlides && isScrollingForward)) index = 0;
        let translateX = index * -100 /this.slides.length;
        if (animation === false) this.track.style.transition = "none";
        this.track.style.transform = `translate3d(${translateX}%, 0, 0)`;
        this.track.offsetHeight // force repaint
        if (animation === false) this.track.style.transition = "";
        this.currentSlide = index;
        this.moveCallBacks.forEach(callBack => callBack(index))
    };

    /**
     * Resets the position if infinite scrolling reaches cloned boundaries.
     * @private
     */
    resetInfinite(){
        const totalRealSlides = this.slides.length - 2 * this.offset;
        if (this.currentSlide < this.offset) {
            this.goToSlide(this.currentSlide + totalRealSlides, false);
        }
        else if (this.currentSlide >= this.offset + totalRealSlides) {
            this.goToSlide(this.currentSlide - totalRealSlides, false);
        }
    }

    /**
     * Registers a callback to execute each time the carousel moves.
     * @param {(index: number) => void} callBack - A function that receives the new index.
     */
    onMove(callBack){
        this.moveCallBacks.push(callBack)
    }
    /**
     * Updates layout and mobile state when the window resizes.
     * @private
     */
    onWindowResize(){
        let mobile = window.innerWidth < 768 //todo voir pour modifier la valeur, possibilité : 768, 992, 1200
        if (this.isMobile !== mobile){
            this.isMobile = mobile
            this.setStyle()
            this.moveCallBacks.forEach(callBack => callBack(this.currentSlide))
            this.slideIndicatorButtons.forEach(button => {button.classList.toggle("_carousel-slide-indicator-button-hidden", this.isMobile)})
        }
    }

    /**
     * Gets the number of slides to scroll, accounting for mobile responsiveness.
     * @type {number}
     */
    get slidesToScroll (){
        return this.isMobile ? 1 : this.options.slidesToScroll
    }

    /**
     * Gets the number of visible slides, accounting for mobile responsiveness.
     * @type {number}
     */
    get slidesVisible (){
        return this.isMobile ? 1 : this.options.slidesVisible
    }

}