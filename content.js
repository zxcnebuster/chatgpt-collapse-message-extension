function processArticle(article) {
  console.log("Processing article:", article);
  const h5Elements = article.querySelectorAll(":scope > h5.sr-only");
  h5Elements.forEach((h5) => {
    console.log("Found h5:", h5.textContent.trim());
    if (h5.textContent.trim() === "You said:") {
      console.log("Condition met. Changing background color.");
      article.style.backgroundColor = "red";
    }
  });
}

function processAllArticles() {
  const articles = document.querySelectorAll("article");
  articles.forEach((article) => {
    processArticle(article);
  });
}

processAllArticles();

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName.toLowerCase() === "article") {
          processArticle(node);
        } else {
          const nestedArticles = node.querySelectorAll("article");
          nestedArticles.forEach((article) => {
            processArticle(article);
          });
        }
      }
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });
