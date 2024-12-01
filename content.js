//refer to article as to a message in the chat as current chatgpt.com has
// console.log("init content");
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
  if (assistantResponse.querySelector(".collapse-state-toggle-button")) {
    return;
  }
  const toggleButtonUser = document.createElement("button");
  toggleButtonUser.className = "collapse-state-toggle-button";
  userRequest.appendChild(toggleButtonUser);
  toggleButtonUser.addEventListener("click", function () {
    const isCollapsed = userRequest.classList.contains("message-collapsed");

    if (isCollapsed) {
      expandMessage(userRequest);
    } else {
      collapseMessage(userRequest);
    }
  });

  const toggleButtonAssistant = document.createElement("button");
  toggleButtonAssistant.className = "collapse-state-toggle-button";
  assistantResponse.appendChild(toggleButtonAssistant);
  toggleButtonAssistant.addEventListener("click", function () {
    const isCollapsed =
      assistantResponse.classList.contains("message-collapsed");

    if (isCollapsed) {
      expandMessage(assistantResponse);
    } else {
      collapseMessage(assistantResponse);
    }
  });
}

function initCollapsing() {
  const h5Elements = document.querySelectorAll("h5.sr-only"); // user reqests
  const userRequests = []; //hold user requests that have corresponding output
  h5Elements.forEach((h5) => {
    if (h5.textContent.trim() === "You said:") {
      const userRequest = h5.closest("article");
      if (userRequest && !userRequests.includes(userRequest)) {
        userRequests.push(userRequest);
      }
    }
  });
  userRequests.forEach((userRequest, index) => {
    // fetch assistant response for corresponding user request
    let assistantResponse = userRequest.nextElementSibling;
    // skip non-article siblings
    while (
      assistantResponse &&
      assistantResponse.tagName.toLowerCase() !== "article"
    ) {
      assistantResponse = assistantResponse.nextElementSibling;
    }
    if (assistantResponse) {
      if (index < userRequests.length - 1) {
        collapseMessage(userRequest);
        collapseMessage(assistantResponse);
        addToggleCollapseButton(userRequest, assistantResponse);
      }
    }
  });
}
let messageNumber = 0;
function handleNewNodes(addedNodes) {
  let numberMessages = document.querySelectorAll("article").length;
  if (numberMessages == messageNumber) {
    return;
  } else {
    messageNumber = numberMessages;
  }
  addedNodes.forEach((node) => {
    // console.log("mutating");
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    if (node.matches && node.matches("article")) {
      const h5 = node.querySelector("h5.sr-only"); // user reqests
      if (h5 && h5.textContent.trim() === "You said:") {
        let assistantResponse = node.nextElementSibling; // find corresponding response if there is one
        // if next sibling is not article search until article found or none next sibling
        while (
          assistantResponse &&
          assistantResponse.tagName.toLowerCase() !== "article"
        ) {
          assistantResponse = assistantResponse.nextElementSibling;
        }
        if (assistantResponse) {
          const totalUserRequest =
            document.querySelectorAll("h5.sr-only").length;
          const shouldCollapse = totalUserRequest > 1;
          if (shouldCollapse) {
            collapseMessage(node);
            collapseMessage(assistantResponse);
          }
          addToggleCollapseButton(node, assistantResponse);
        }
      }
    } else {
      //inapplicable case?
      const h5Elements = node.querySelectorAll("h5.sr-only");
      h5Elements.forEach((h5) => {
        // console.log("mutating multiple");
        // console.log("iterated through sr-only");
        if (h5 && h5.textContent.trim() === "You said:") {
          const userRequest = h5.closest("article");
          //   console.log("sibling identified");
          if (
            userRequest &&
            !(
              userRequest.classList.contains("message-collapsed") ||
              userRequest.classList.contains("message-expanded")
            )
          ) {
            // console.log("proceeding with sibling");
            // console.log(userRequest);
            let assistantResponse = userRequest.nextElementSibling;
            // console.log(assistantResponse);
            // console.log(assistantResponse.tagName.toLowerCase());
            while (
              assistantResponse &&
              assistantResponse.tagName.toLowerCase() !== "article"
            ) {
              //   console.log("looping siblings");
              assistantResponse = assistantResponse.nextElementSibling;
            }
            if (assistantResponse) {
              //   console.log("check should collapse");
              const totalUserRequest =
                document.querySelectorAll("h5.sr-only").length;
              const shouldCollapse = totalUserRequest > 1;
              if (shouldCollapse) {
                // console.log("collapsing");

                if (assistantResponse.nextElementSibling !== null) {
                  collapseMessage(userRequest);
                  collapseMessage(assistantResponse);
                }
              }
              addToggleCollapseButton(node, assistantResponse);
            }
          }
        }
      });
    }
  });
}
//new content (request/responses must be monitored)
function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        handleNewNodes(mutation.addedNodes);
      }
    });
  });
  const articlesWrapper = document.querySelector('[role="presentation"]');
  observer.observe(articlesWrapper, { childList: true, subtree: true });
  return observer;
}

function initialise() {
  initCollapsing();
  const observer = setupMutationObserver();
}
initialise();
