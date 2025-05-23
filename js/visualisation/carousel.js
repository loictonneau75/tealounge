import * as domHelpers from "../dom_helpers.js";

export class Carousel{
    constructor(slides, options = {slidesToScroll: 1, slidesVisible: 3, loop: false, slideIndicator: true, infinite: true}){
        this.options = options;
        if (this.options.loop && this.options.infinite) throw new Error("a carousel can't be in loop mode and in infinite mode at the same time")
        this.wrapper = domHelpers.createCustomElement({tag:"div", classList: ["_carousel-wrapper"]});
        this.slides = slides;
        this.currentItem = 0;
        this.track = domHelpers.createCustomElement({tag:"div", classList: ["_carousel-track"]});
        this.moveCallBacks = []
        this.offset = 0
        if (this.options.infinite){
            this.offset = this.options.slidesVisible + this.options.slidesToScroll -1
            this.slides = [
                ...this.slides.slice(this.slides.length - this.offset).map(item => item.cloneNode(true)),
                ...this.slides,
                ...this.slides.slice(0, this.offset).map(item => item.cloneNode(true))
            ]
            this.goToItem(this.offset, false)
            this.track.addEventListener("transitionend", this.resetInfinite.bind(this))
        }
        
        this.isMobile = false
        this.slideIndicatorButtons = []
        this.carousel = domHelpers.createCustomElement({tag:"div", classList: ["_carousel"]});
        this.viewport = domHelpers.createCustomElement({tag: "div", classList: ["_carousel-viewport"]})
        this.carousel.appendChild(this.track);
        this.viewport.appendChild(this.carousel)
        this.wrapper.appendChild(this.viewport);
        
        this.track.append(...this.slides);
        this.setStyle();
        this.createNavigation();
        if (this.options.slideIndicator) this.createSlideIndicator()
        this.moveCallBacks.forEach(callBack => callBack(this.currentItem))
        this.onWindowResize()
        window.addEventListener("resize", this.onWindowResize.bind(this))
        
        return this.wrapper;
    };

    setStyle(){
        let ratio = this.slides.length / this.slidesVisible;
        this.track.style.width = (ratio * 100) + "%";
        this.slides.forEach(slide => {
            slide.classList.add("_carousel-slide")
            slide.style.width = ((100 / this.slidesVisible) / ratio) + "%"
        });
        this.adjustHeight();
        
    };

    adjustHeight(){
        let maxHeight = 0;
        requestAnimationFrame(() => {
            this.slides.forEach(item => {if (item.offsetHeight > maxHeight) maxHeight = item.offsetHeight});
            this.slides.forEach(item => {item.children[0].style.height = maxHeight+"px"});
        });
    };

    createNavigation(){
        let nextButton = domHelpers.createCustomElement({tag: "div", classList:["_carousel-next"]});
        let prevButton = domHelpers.createCustomElement({tag: "div", classList:["_carousel-prev"]});
        this.wrapper.append(nextButton, prevButton);
        nextButton.addEventListener("click", this.next.bind(this));
        prevButton.addEventListener("click", this.prev.bind(this));
        if(this.options.loop === false){ this.onMove(index => {
            prevButton.classList.toggle("_carousel-prev-hidden", index === 0);
            nextButton.classList.toggle("_carousel-next-hidden", this.slides[this.currentItem + this.slidesVisible] === undefined)
        })}
    };

    createSlideIndicator() {
        const slideIndicator = domHelpers.createCustomElement({tag: "div", classList: ["_carousel-slide-indicator"]});
        this.wrapper.appendChild(slideIndicator);

        const offset = this.options.infinite ? this.offset : 0;
        const totalSlides = this.slides.length - (this.options.infinite ? 2 * this.offset : 0);

        // 🧠 Calcule la dernière position de départ valide
        const maxStartIndex = this.options.loop
            ? totalSlides - this.options.slidesVisible
            : totalSlides - this.options.slidesVisible;

        // 🧱 Crée les boutons de pagination
        for (let i = 0; i <= maxStartIndex; i += this.options.slidesToScroll) {
            const button = domHelpers.createCustomElement({tag: "div", classList: ["_carousel-slide-indicator-button"]});
            button.addEventListener("click", () => this.goToItem(i + offset));
            slideIndicator.appendChild(button);
            this.slideIndicatorButtons.push(button);
        }

        // ⭐ Active le bon bouton lors du déplacement
        this.onMove(index => {
            const count = totalSlides;
            const realIndex = (index - offset + count) % count; // modulo pour éviter indices négatifs
            const buttonIndex = Math.floor(realIndex / this.options.slidesToScroll);
            const activeButton = this.slideIndicatorButtons[buttonIndex];
            if (activeButton) {
                this.slideIndicatorButtons.forEach(button => button.classList.remove("_carousel-slide-indicator-button-active"));
                activeButton.classList.add("_carousel-slide-indicator-button-active");
            }
        });
    }


    next(){
        this.goToItem(this.currentItem + this.slidesToScroll);
    };

    prev(){
        this.goToItem(this.currentItem - this.slidesToScroll);
    };

    goToItem(index, animation = true){
        const isBeyondEnd = index > this.slides.length;
        const noMoreVisibleSlides = this.slides[this.currentItem + this.slidesVisible] === undefined;
        const isScrollingForward = index > this.currentItem;
        if (index <0) index = this.slides.length - this.slidesVisible;
        else if (isBeyondEnd || (noMoreVisibleSlides && isScrollingForward)) index = 0;
        let translateX = index * -100 /this.slides.length;
        if (animation === false) this.track.style.transition = "none";
        this.track.style.transform = `translate3d(${translateX}%, 0, 0)`;
        this.track.offsetHeight // force repaint
        if (animation === false) this.track.style.transition = "";
        this.currentItem = index;
        this.moveCallBacks.forEach(callBack => callBack(index))
    };

    resetInfinite(){
        const totalRealSlides = this.slides.length - 2 * this.offset;
        if (this.currentItem < this.offset) {
            this.goToItem(this.currentItem + totalRealSlides, false);
        }
        else if (this.currentItem >= this.offset + totalRealSlides) {
            this.goToItem(this.currentItem - totalRealSlides, false);
        }
    }

    onMove(callBack){
        this.moveCallBacks.push(callBack)
    }

    onWindowResize(){
        let mobile = window.innerWidth < 1200 //todo voir pour modifier la valeur, possibilité : 768, 992, 1200
        if (this.isMobile !== mobile){
            this.isMobile = mobile
            this.setStyle()
            this.moveCallBacks.forEach(callBack => callBack(this.currentItem))
            this.slideIndicatorButtons.forEach(button => {button.classList.toggle("_carousel-slide-indicator-button-hidden", this.isMobile)})
        }
    }

    get slidesToScroll (){
        return this.isMobile ? 1 : this.options.slidesToScroll
    }

    get slidesVisible (){
        return this.isMobile ? 1 : this.options.slidesVisible
    }

}