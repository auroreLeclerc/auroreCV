import { ArchitectureError } from "../Errors.js";

export class Prettify {
	#accordions = document.getElementsByClassName("accordion prettify-js");
	/**
	 * @readonly
	 * @type {{[key: string]: string}}
	 * @description space are mandatory even for no-space phrase
	 * @description the first letter of the first word can be lowercase, the algo doesn't mind
	 */
	static fullTexts = {
		MBTI: "Myers Briggs Type Indicator",
		INTP: "Introverted i- Ntuitive Thinking Prospecting",
		MIAGE: "Méthodes Informatiques Appliquées à la Gestion des Entreprises",
		DUT: "Diplôme Universitaire de Technologie en",
		MIG: "Maths Informatique et Gestion",
		SVT: "Sciences de la Vie et de la Terre",
		ISN: "Informatique et Sciences du Numérique",
		RPA: "Robotic Process Automation",
		SBPA: "SAP Business Process Automation",
		SDK: "Software Development Kit",
		JS: "Java Script",
		TS: "Type Script",
		JEE: "Jakarta Enterprise Edition",
		HTML: "Hyper Text Markup Language",
		CSS: "Cascading Style Sheets",
		PWA: "Progressive Web App",
		MVC: "Model View Controller",
		SQL: "Structured Query Languages",
		DOM: "Document Object Model",
		UML: "Unified Modeling Language",
		POO: "Programmation Orientée Objet",
		PM: "Product Manager",
		QA: "Quality Analyst",
		MUI: "Material User Interface",
		SGBD: "Système de Gestion de Base de Données",
	};


	constructor() {
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
			if (accordion.textContent in Prettify.fullTexts) {
				const fullText = Prettify.fullTexts[accordion.textContent];
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
			else throw new ArchitectureError(`${accordion.textContent} is missing in Prettify !`);
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
