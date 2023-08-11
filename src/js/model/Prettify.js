export class Prettify {
	#accordions = document.getElementsByClassName("accordion");

	constructor() {
		while (this.#accordions.length > 0) { // original array is dynamically slice with Element.replaceWith() 
			const accordion = this.#accordions[0];
			accordion.textContent = accordion.textContent.trim(); // security

			const accordionised = document.createElement("div");
			accordionised.setAttribute("class", "accordionised");
			const fullText = accordion.getAttribute("accordion");
			let nextInitial = 0;
			/**
			 * @type {{ container: HTMLElement; initial: HTMLElement; lowercase: HTMLElement; }[]}
			 */
			let containers = [];
		
			for (let i = 0; i < accordion.textContent.length; i++) {
				const container = document.createElement("div");
				container.setAttribute("class", "container");
		
				const initial = document.createElement("span");
				initial.setAttribute("class", "initial");
				initial.textContent = accordion.textContent[i];
				container.appendChild(initial);
		
				const firstInitial = nextInitial ? fullText.indexOf(accordion.textContent[i]) : nextInitial;
				nextInitial = fullText.indexOf(accordion.textContent[i + 1], firstInitial);
				if (nextInitial === -1) nextInitial = fullText.length + 1;
				const textBetweenThoseTwoInitials = fullText.substring(firstInitial + 1, nextInitial - 1); // spaces are css handled
		
				const lowercase = document.createElement("span");
				lowercase.setAttribute("class", "lowercase");
				lowercase.textContent = textBetweenThoseTwoInitials;
				container.appendChild(lowercase);
		
				containers.push({
					container: container,
					initial: initial,
					lowercase: lowercase
				});
		
				accordionised.appendChild(container);
			}

			this.#addEvents(accordionised, containers, accordion);
		}
	}

	/**
	 * @param {HTMLDivElement} accordionised
	 * @param {{ container: HTMLElement; initial: HTMLElement; lowercase: HTMLElement; }[]} containers
	 * @param {Element} accordion
	 */
	#addEvents(accordionised, containers, accordion) {		
		accordionised.addEventListener("mouseover", () => {
			for (const container of containers) {
				const initial = container.initial.clientWidth;
				const lowercase = container.lowercase.clientWidth;
	
				container.container.style.width = `${initial + lowercase}px`;
			}
		});
		accordionised.addEventListener("click", () => {
			accordionised.classList.add("clicked");
		});
		document.body.addEventListener("click", event => {
			let notOutclick = 0;
			if (!(event.target instanceof SVGCircleElement)) {
				throw TypeError(`You clicked on a ${Object.prototype.toString.call(event.target)}, "wich is not a SVGCircleElement for some unknown reasons...`);
			}
			for (const className of ["accordionised", "container", "initial", "lowercase"]) {
				notOutclick += Number(event.target.classList.contains(className));
			}
			if (notOutclick <= 0) {
				accordionised.classList.remove("clicked");
				accordionised.dispatchEvent(new MouseEvent("mouseleave"));
			}
		});
		accordionised.addEventListener("mouseleave", () => {
			for (const container of containers) {
				if (!accordionised.classList.contains("clicked")) {
					const initial = container.initial.clientWidth;
					container.container.style.width = `${initial}px`;
				}
			}
		});
	
		accordion.replaceWith(accordionised);
		setTimeout(() => {
			accordionised.dispatchEvent(new MouseEvent("mouseover"));
			accordionised.dispatchEvent(new MouseEvent("mouseleave"));
		}, 500);
	}
}