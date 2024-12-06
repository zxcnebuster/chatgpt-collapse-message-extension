function collapseMessage(message) {
  message.classList.add("message-collapsed");
  message.classList.remove("message-expanded");
}

function expandMessage(message) {
  message.classList.add("message-expanded");
  message.classList.remove("message-collapsed");
}

function addToggleCollapseButton(userRequest, assistantResponse) {
  if (userRequest.querySelector(".collapse-state-toggle-button")) {
    return;
  }
  const toggleButton = document.createElement("button");
  toggleButton.className = "collapse-state-toggle-button";
  userRequest.appendChild(toggleButton);
  toggleButton.addEventListener("click", function () {
    const isCollapsed = userRequest.classList.contains("message-collapsed");
    if (isCollapsed) {
      expandMessage(userRequest);
      expandMessage(assistantResponse);
    } else {
      collapseMessage(userRequest);
      collapseMessage(assistantResponse);
    }
  });
}

function isLastSibling(node) {
  if (!node || !(node instanceof Element)) {
    throw new Error("Invalid node provided.");
  }

  const nextSibling = node.nextElementSibling;
  if (nextSibling) {
    return false;
  }

  return true;
}
function processMessagePair(userRequest, assistantResponse, shouldCollapse) {
  if (!userRequest || !assistantResponse) return;

  if (shouldCollapse && !isLastSibling(assistantResponse)) {
    collapseMessage(userRequest);
    collapseMessage(assistantResponse);
  }
  addToggleCollapseButton(userRequest, assistantResponse);
}

function initCollapsing() {
  const h5Elements = document.querySelectorAll("h5.sr-only");
  const userRequests = [];

  h5Elements.forEach((h5) => {
    if (h5.textContent.trim() === "You said:") {
      const userRequest = h5.closest("article");
      if (userRequest && !userRequests.includes(userRequest)) {
        userRequests.push(userRequest);
      }
    }
  });

  const totalUserRequests = userRequests.length;
  const shouldCollapse = totalUserRequests > 1;
  userRequests.forEach((userRequest) => {
    let assistantResponse = userRequest.nextElementSibling;
    while (
      assistantResponse &&
      assistantResponse.tagName.toLowerCase() !== "article"
    ) {
      assistantResponse = assistantResponse.nextElementSibling;
    }
    processMessagePair(userRequest, assistantResponse, shouldCollapse);
  });
}

function handleNewNodes(addedNodes) {
  addedNodes.forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    if (node.matches && node.matches("article")) {
      const h5 = node.querySelector("h5.sr-only");
      if (h5 && h5.textContent.trim() === "You said:") {
        const userRequest = node;
        let assistantResponse = userRequest.nextElementSibling;
        while (
          assistantResponse &&
          assistantResponse.tagName.toLowerCase() !== "article"
        ) {
          assistantResponse = assistantResponse.nextElementSibling;
        }
        const totalUserRequests =
          document.querySelectorAll("h5.sr-only").length;
        const shouldCollapse = totalUserRequests > 1;
        processMessagePair(userRequest, assistantResponse, shouldCollapse);
      }
    }
  });
}

function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        handleNewNodes(mutation.addedNodes);
      }
    });
  });
  const articlesWrapper = document.querySelector(
    ".flex.flex-col.text-sm.md\\:pb-9"
  );
  observer.observe(articlesWrapper, { childList: true, subtree: true });
}

const waitForElement = (selector, callback) => {
  const observer = new MutationObserver((mutationsList, observer) => {
    const element = document.querySelector(selector);
    if (element) {
      callback(element);
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

function initialise() {
  waitForElement(".flex.flex-col.text-sm.md\\:pb-9", (element) => {
    initCollapsing();
    setupMutationObserver();
  });
}

initialise();
