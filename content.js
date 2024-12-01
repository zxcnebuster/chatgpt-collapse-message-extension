function getRandomColor() {
  const randomInt = Math.floor(Math.random() * 16777216);
  const hexColor = `#${randomInt.toString(16).padStart(6, "0")}`;
  return hexColor;
}

function processArticlePair(userArticle, assistantArticle) {
  if (
    userArticle.dataset.paired === "true" ||
    assistantArticle.dataset.paired === "true"
  ) {
    return; // Skip already processed pairs
  }

  const randomColor = getRandomColor();

  userArticle.style.backgroundColor = randomColor;
  assistantArticle.style.backgroundColor = randomColor;

  userArticle.dataset.paired = "true";
  assistantArticle.dataset.paired = "true";
}

function processAllArticlePairs() {
  // Select all <h5> elements with class 'sr-only' and exact text 'You said:'
  const h5Elements = document.querySelectorAll("h5.sr-only");

  h5Elements.forEach((h5) => {
    // Check if the h5 contains the exact text 'You said:'
    if (h5.textContent.trim() === "You said:") {
      // Find the parent <article> of this <h5>
      const userArticle = h5.closest("article");

      if (userArticle) {
        // Find the next sibling <article> (assistant's response)
        let assistantArticle = userArticle.nextElementSibling;
        // In case non-article elements involved in between (warnings, review prompts)
        while (
          assistantArticle &&
          assistantArticle.tagName.toLowerCase() !== "article"
        ) {
          assistantArticle = assistantArticle.nextElementSibling;
        }

        if (assistantArticle) {
          processArticlePair(userArticle, assistantArticle);
        }
      }
    }
  });
}

function initialize() {
  // Initial processing of existing article pairs
  processAllArticlePairs();

  // Set up a MutationObserver to watch for new articles added to the DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName.toLowerCase() === "article") {
            const h5 = node.querySelector("h5.sr-only");
            if (h5 && h5.textContent.trim() === "You said:") {
              let assistantArticle = node.nextElementSibling;

              while (
                assistantArticle &&
                assistantArticle.tagName.toLowerCase() !== "article"
              ) {
                assistantArticle = assistantArticle.nextElementSibling;
              }

              if (assistantArticle) {
                processArticlePair(node, assistantArticle);
              }
            }
          } else {
            // If a non-<article> node is added, it might contain multiple <article> elements
            const nestedH5Elements = node.querySelectorAll("h5.sr-only");
            nestedH5Elements.forEach((h5) => {
              if (h5.textContent.trim() === "You said:") {
                const userArticle = h5.closest("article");

                if (userArticle) {
                  let assistantArticle = userArticle.nextElementSibling;

                  while (
                    assistantArticle &&
                    assistantArticle.tagName.toLowerCase() !== "article"
                  ) {
                    assistantArticle = assistantArticle.nextElementSibling;
                  }

                  if (assistantArticle) {
                    processArticlePair(userArticle, assistantArticle);
                  }
                }
              }
            });
          }
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

initialize();
