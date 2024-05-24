import { ArchitectureError } from "../Errors.js";

export class Prettify {
	#accordions = document.getElementsByClassName("accordion prettify-js");
	/**
	 * @type {Map<string, string>}
	 * @description space are mandatory even for no-space phrase
	 * @description the first letter of the first word can be lowercase, the algo doesn't mind
	 */
	#fullTexts = new Map();

	#initMap() {
		this.#fullTexts.set("MBTI", "Myers Briggs Type Indicator");
		this.#fullTexts.set("INTP", "Introverted i- Ntuitive Thinking Prospecting");
		this.#fullTexts.set("MIAGE", "Méthodes Informatiques Appliquées à la Gestion des Entreprises");
		this.#fullTexts.set("DUT", "Diplôme Universitaire de Technologie en");
		this.#fullTexts.set("MIG", "Maths Informatique et Gestion");
		this.#fullTexts.set("SVT", "Sciences de la Vie et de la Terre");
		this.#fullTexts.set("ISN", "Informatique et Sciences du Numérique");
		this.#fullTexts.set("BPI", "Business Process Intelligence");
		this.#fullTexts.set("BTP", "Business Technology Platform");
		this.#fullTexts.set("RPA", "Robotic Process Automation");
		this.#fullTexts.set("iRPA", "intelligent Robotic Process Automation");
		this.#fullTexts.set("SBPA", "SAP Business Process Automation");
		this.#fullTexts.set("SDK", "Software Development Kit");
		this.#fullTexts.set("JS", "Java Script");
		this.#fullTexts.set("HTML", "Hyper Text Markup Language");
		this.#fullTexts.set("CSS", "Cascading Style Sheets");
		this.#fullTexts.set("PWA", "Progressive Web App");
		this.#fullTexts.set("MVC", "Model View Controller");
		this.#fullTexts.set("SQL", "Structured Query Languages");
		this.#fullTexts.set("DOM", "Document Object Model");
		this.#fullTexts.set("AJAX", "Asynchronous JavaScript And XML");
		this.#fullTexts.set("UML", "Unified Modeling Language");
		this.#fullTexts.set("VBA", "Visual Basic for Applications");
		this.#fullTexts.set("UPJV", "Université de Picardie Jules-Verne");
	}

	constructor() {
		this.#initMap();
		while (this.#accordions.length > 0) {
			const accordion = this.#accordions[0]; // original array is dynamically slice with Element.replaceWith()
			accordion.textContent = accordion.textContent.trim();

			const accordionised = document.createElement("div");
			accordionised.setAttribute("class", "accordionised");
			for (const className of accordion.classList.values()) {
				if (className !== "accordion" && className !== "prettify-js") {
					accordionised.classList.add(className);
				}
			}
			if (this.#fullTexts.has(accordion.textContent)) {
				const fullText = this.#fullTexts.get(accordion.textContent);
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

					const firstInitial = nextInitial || fullText.indexOf(accordion.textContent[i]);
					nextInitial = fullText.indexOf(accordion.textContent[i + 1], firstInitial + 1);
					if (nextInitial === -1) nextInitial = fullText.length + 1;
					const textBetweenThoseTwoInitials = fullText.substring(firstInitial + 1, nextInitial - 1); // spaces are css handled

					const lowercase = document.createElement("span");
					lowercase.setAttribute("class", "lowercase");
					lowercase.textContent = textBetweenThoseTwoInitials;
					container.appendChild(lowercase);

					containers.push({
						container: container,
						initial: initial,
						lowercase: lowercase,
					});

					accordionised.appendChild(container);
				}

				this.#addEvents(accordionised, containers, accordion);
			}
			else throw new ArchitectureError(accordion.textContent);
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
			if (!(event.target instanceof Element)) {
				throw new ArchitectureError(JSON.stringify(event.target));
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
