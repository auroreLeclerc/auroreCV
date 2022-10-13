const accordions = document.getElementsByClassName("accordion");

while (accordions.length > 0) { // original array is dynamically slice with Element.replaceWith() 
	const accordion = accordions[0];
	accordion.textContent = accordion.textContent.replace(/\s/g, ''); // remove spaces security

	const accordionised = document.createElement("div");
	accordionised.setAttribute("class", "accordionised");
	const fullText = accordion.getAttribute("accordion");
	let nextInitial = "", containers = [];

	for (let i = 0; i < accordion.textContent.length; i++) {
		const container = document.createElement("div");
		container.setAttribute("class", "container");

		const initial = document.createElement("span");
		initial.setAttribute("class", "initial");
		initial.textContent = accordion.textContent[i];
		container.appendChild(initial);

		const firstInitial = !nextInitial ? fullText.indexOf(accordion.textContent[i]) : nextInitial;
		nextInitial = fullText.indexOf(accordion.textContent[i + 1], firstInitial);
		if (nextInitial === -1) nextInitial = fullText.length + 1;
		const textBetweenThoseTwoInitials = fullText.substring(firstInitial + 1, nextInitial);

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

	accordionised.addEventListener("mouseover", () => {
		for (const container of containers) {
			const initial = container.initial.clientWidth;
			const lowercase = container.lowercase.clientWidth;

			container.container.style.width = `${initial + lowercase}px`;
		}
	});
	accordionised.addEventListener("mouseleave", () => {
		for (const container of containers) {
			const initial = container.initial.clientWidth;
			container.container.style.width = `${initial}px`;
		}
	});

	accordion.replaceWith(accordionised);
	setTimeout(() => {
		accordionised.dispatchEvent(new MouseEvent("mouseover"));
		accordionised.dispatchEvent(new MouseEvent("mouseleave"));
	}, 500);
}