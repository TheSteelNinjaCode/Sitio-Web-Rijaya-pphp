var eventAttributes = [
  "onclick",
  "ondblclick",
  "onmousedown",
  "onmouseup",
  "onmouseover",
  "onmousemove",
  "onmouseout",
  "onwheel",
  "onkeypress",
  "onkeydown",
  "onkeyup",
  "onfocus",
  "onblur",
  "onchange",
  "oninput",
  "onselect",
  "onsubmit",
  "onreset",
  "onresize",
  "onscroll",
  "onload",
  "onunload",
  "onabort",
  "onerror",
  "onbeforeunload",
  "oncopy",
  "oncut",
  "onpaste",
  "ondrag",
  "ondragstart",
  "ondragend",
  "ondragover",
  "ondragenter",
  "ondragleave",
  "ondrop",
  "oncontextmenu",
  "ontouchstart",
  "ontouchmove",
  "ontouchend",
  "ontouchcancel",
  "onpointerdown",
  "onpointerup",
  "onpointermove",
  "onpointerover",
  "onpointerout",
  "onpointerenter",
  "onpointerleave",
  "onpointercancel",
];
document.addEventListener("DOMContentLoaded", attachWireFunctionEvents);
const state = {
  checkedElements: new Set(),
};
let responseData = null;
function attachWireFunctionEvents() {
  handleHiddenAttribute();
  const interactiveElements = document.querySelectorAll(
    "button, input, select, textarea, a, form, label, div, span"
  );
  interactiveElements.forEach((element) => {
    handleAnchorTag(element);
    eventAttributes.forEach((attr) => {
      const originalHandler = element.getAttribute(attr);
      const eventType = attr.slice(2); // Get the event type (e.g., "click" from "onclick")
      if (originalHandler) {
        element.removeAttribute(attr);
        handleDebounce(element, eventType, originalHandler);
      }
    });
    // Special handling for form submit
    if (element instanceof HTMLFormElement) {
      const submitHandler = element.getAttribute("onsubmit");
      if (submitHandler) {
        element.removeAttribute("onsubmit");
        handleDebounce(element, "submit", submitHandler);
      }
    }
  });
}
function handleHiddenAttribute() {
  const hiddenElements = document.querySelectorAll("[pp-hidden]");
  hiddenElements.forEach((element) => {
    let hiddenAttr = element.getAttribute("pp-hidden");
    if (!hiddenAttr) return;
    // Determine if the attribute is JSON-like or a simple time value
    if (isJsonLike(hiddenAttr)) {
      try {
        // Normalize single quotes to double quotes for JSON parsing
        const config = parseJson(hiddenAttr);
        handleElementVisibility(element, config);
      } catch (error) {
        console.error("JSON parsing error:", error);
      }
    } else {
      // Handle non-JSON attribute as simple time value
      const timeout = parseTime(hiddenAttr);
      if (timeout > 0) {
        // Directly schedule hiding after the timeout for non-JSON value
        scheduleVisibilityChange(element, timeout, "hidden");
      }
    }
  });
}
// Function to determine if a string is JSON-like
function isJsonLike(str) {
  // A simple check to see if the string starts with '{' and ends with '}'
  return str.trim().startsWith("{") && str.trim().endsWith("}");
}
// Function to handle visibility changes based on config
function handleElementVisibility(element, config) {
  const startTimeout = config.start ? parseTime(config.start) : 0;
  const endTimeout = config.end ? parseTime(config.end) : 0;
  if (startTimeout > 0) {
    // Start hidden and show after startTimeout
    element.style.visibility = "hidden";
    scheduleVisibilityChange(element, startTimeout, "visible");
    // If endTimeout is also specified, hide again after endTimeout relative to startTimeout
    if (endTimeout > 0) {
      scheduleVisibilityChange(element, startTimeout + endTimeout, "hidden");
    }
  } else if (endTimeout > 0) {
    // If no startTimeout but endTimeout is specified, only hide after endTimeout
    scheduleVisibilityChange(element, endTimeout, "hidden");
  }
}
// Function to schedule visibility changes using requestAnimationFrame
function scheduleVisibilityChange(element, timeout, visibility) {
  setTimeout(() => {
    requestAnimationFrame(() => {
      element.style.visibility = visibility;
    });
  }, timeout);
}
// Function to parse time strings into milliseconds
function parseTime(time) {
  if (typeof time === "number") {
    return time;
  }
  const match = time.match(/^(\d+)(ms|s|m)?$/);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2] || "ms"; // Default to milliseconds if no unit specified
    switch (unit) {
      case "ms":
        return value;
      case "s":
        return value * 1000;
      case "m":
        return value * 60 * 1000;
      default:
        return value; // Default to milliseconds
    }
  }
  return 0; // Default to 0 if parsing fails
}
async function handleDebounce(element, eventType, originalHandler) {
  const debounceTime = element.getAttribute("pp-debounce") || "";
  const executeFirst = element.getAttribute("pp-trigger") || "";
  const targetOnlyAttribute = element.getAttribute("pp-target-only") || "";
  const combinedHandler = async (event) => {
    event.preventDefault();
    try {
      if (executeFirst || targetOnlyAttribute) {
        if (targetOnlyAttribute) {
          invokeHandler(element, executeFirst);
        } else {
          await invokeHandler(element, executeFirst);
        }
      }
      // Execute the original handler
      await invokeHandler(element, originalHandler);
    } catch (error) {
      console.error("Error in debounced handler:", error);
    }
  };
  if (debounceTime) {
    const wait = parseTime(debounceTime);
    const debouncedHandler = debounce(combinedHandler, wait);
    if (element instanceof HTMLFormElement && eventType === "submit") {
      element.addEventListener(eventType, (event) => {
        event.preventDefault();
        debouncedHandler(event);
      });
    } else {
      element.addEventListener(eventType, debouncedHandler);
    }
  } else {
    element.addEventListener(eventType, combinedHandler);
  }
}
async function invokeHandler(element, handler) {
  try {
    // Extract method details from the handler string
    const methodMatch = handler.match(/^(\w+(\.\w+)*)\((.*)\)$/);
    if (methodMatch) {
      const fullMethodName = methodMatch[1];
      const argsString = methodMatch[3];
      // Resolve context for nested methods
      const methodParts = fullMethodName.split(".");
      const { context, methodName } = resolveContext(methodParts);
      // Check if the resolved method is a function
      if (typeof context[methodName] === "function") {
        const args = parseArguments(argsString);
        await context[methodName](...args);
      } else {
        await handleParsedCallback(element, handler);
      }
    } else {
      await handleParsedCallback(element, handler);
    }
  } catch (error) {
    console.error(`Error executing handler ${handler}:`, error);
  }
}
/**
 * Resolve the context and method name for nested methods.
 * @param methodParts - Array of method parts split by dots.
 * @returns Object containing the resolved context and method name.
 */
function resolveContext(methodParts) {
  let context = window;
  for (let i = 0; i < methodParts.length - 1; i++) {
    context = context[methodParts[i]];
    if (!context) {
      throw new Error(`Cannot find object ${methodParts[i]} in the context.`);
    }
  }
  return { context, methodName: methodParts[methodParts.length - 1] };
}
/**
 * Parse arguments string into an array.
 * @param argsString - Comma-separated string of arguments.
 * @returns Parsed arguments as an array.
 */
function parseArguments(argsString) {
  return argsString ? JSON.parse(`[${argsString}]`) : [];
}
/**
 * Handle parsing and executing the callback from the element's handler.
 * @param element - HTML element that initiated the handler.
 * @param handler - Handler string to be parsed and executed.
 */
async function handleParsedCallback(element, handler) {
  const { funcName, data } = parseCallback(element, handler);
  if (!funcName) return;
  const func = window[funcName];
  if (typeof func === "function") {
    const args = Array.isArray(data.args) ? data.args : [];
    const responseJSON = responseData ? parseJson(responseData) : null;
    await func(...args, element, data, responseJSON);
  } else {
    responseData = await handleUndefinedFunction(element, funcName, data);
  }
}
async function handleAnchorTag(element) {
  if (!(element instanceof HTMLAnchorElement)) return;
  element.addEventListener("click", (event) => {
    const anchor = event.currentTarget;
    const href = anchor.getAttribute("href");
    const target = anchor.getAttribute("target");
    // If there's no href, or the target is _blank, or the meta key is pressed, allow default behavior
    if (!href || target === "_blank" || event.metaKey || event.ctrlKey) {
      return;
    }
    event.preventDefault(); // Prevent the default navigation
    // Check if the link is external
    const isExternal =
      /^(https?:)?\/\//i.test(href) && !href.startsWith(window.location.origin);
    if (isExternal) {
      // If the link is external, use the default behavior
      window.location.href = href;
    } else {
      // If the link is internal, use history.pushState
      try {
        history.pushState(null, "", href);
        window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
      } catch (error) {
        console.error("Anchor click error:", error);
      }
    }
  });
}
function updateDocumentContent(data) {
  if (data.includes("<!DOCTYPE html>")) {
    const newDoc = new DOMParser().parseFromString(data, "text/html");
    document.replaceChild(
      document.adoptNode(newDoc.documentElement),
      document.documentElement
    );
  } else {
    saveState();
    const scrollPositions = saveScrollPositions();
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(data, "text/html");
    const scripts = Array.from(newDoc.body.querySelectorAll("script"));
    const styles = Array.from(newDoc.head.querySelectorAll("style"));
    const newBody = newDoc.body;
    diffAndPatch(document.body, newBody);
    restoreState();
    restoreScrollPositions(scrollPositions);
    // Load styles
    styles.forEach((style) => {
      const newStyle = document.createElement("style");
      newStyle.textContent = style.textContent;
      document.head.appendChild(newStyle);
    });
    // Load scripts
    scripts.forEach((script) => {
      if (script.src) {
        loadScript(script.src);
      } else {
        const newScript = document.createElement("script");
        newScript.textContent = script.textContent;
        document.body.appendChild(newScript);
        document.body.removeChild(newScript);
      }
    });
  }
  attachWireFunctionEvents();
}
function diffAndPatch(oldNode, newNode) {
  // If nodes are of different types, replace old with new
  if (oldNode.nodeType !== newNode.nodeType) {
    oldNode.parentNode?.replaceChild(newNode, oldNode);
    return;
  }
  // Compare text nodes
  if (
    oldNode.nodeType === Node.TEXT_NODE &&
    newNode.nodeType === Node.TEXT_NODE
  ) {
    if (oldNode.textContent !== newNode.textContent) {
      oldNode.textContent = newNode.textContent;
    }
    return;
  }
  // Compare element nodes
  if (oldNode instanceof HTMLElement && newNode instanceof HTMLElement) {
    oldNode.replaceWith(newNode);
  }
}
function loadScript(src) {
  const script = document.createElement("script");
  script.src = src;
  document.head.appendChild(script);
}
function saveState() {
  const focusElement = document.activeElement;
  state.focusId = focusElement?.id || focusElement?.name;
  state.focusValue = focusElement?.value;
  state.focusChecked = focusElement?.checked;
  state.focusType = focusElement?.type;
  state.focusSelectionStart = focusElement?.selectionStart;
  state.focusSelectionEnd = focusElement?.selectionEnd;
  state.isSuspense = focusElement.hasAttribute("pp-suspense");
  state.checkedElements.clear();
  document.querySelectorAll('input[type="checkbox"]:checked').forEach((el) => {
    state.checkedElements.add(el.id || el.name);
  });
  document.querySelectorAll('input[type="radio"]:checked').forEach((el) => {
    state.checkedElements.add(el.id || el.name);
  });
}
function restoreState() {
  if (state.focusId) {
    const newFocusElement =
      document.getElementById(state.focusId) ||
      document.querySelector(`[name="${state.focusId}"]`);
    if (newFocusElement instanceof HTMLInputElement) {
      newFocusElement.focus();
      const length = newFocusElement.value.length || 0;
      if (
        state.focusSelectionStart !== undefined &&
        state.focusSelectionEnd !== null
      ) {
        newFocusElement.setSelectionRange(length, length);
      }
      if (state.focusValue) {
        if (
          newFocusElement.type === "checkbox" ||
          newFocusElement.type === "radio"
        ) {
          newFocusElement.checked = !!state.focusChecked;
        } else {
          const isSuspense = newFocusElement.hasAttribute("pp-suspense");
          if (!isSuspense && !state.isSuspense)
            newFocusElement.value = state.focusValue;
        }
      }
    } else if (newFocusElement instanceof HTMLTextAreaElement) {
      newFocusElement.focus();
      const length = newFocusElement.value.length || 0;
      if (
        state.focusSelectionStart !== undefined &&
        state.focusSelectionEnd !== null
      ) {
        newFocusElement.setSelectionRange(length, length);
      }
      if (state.focusValue) {
        newFocusElement.value = state.focusValue;
      }
    } else if (newFocusElement instanceof HTMLSelectElement) {
      newFocusElement.focus();
      if (state.focusValue) {
        newFocusElement.value = state.focusValue;
      }
    }
  }
  state.checkedElements.forEach((id) => {
    const checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.checked = true;
    }
  });
}
function saveScrollPositions() {
  const scrollPositions = {};
  document.querySelectorAll("*").forEach((el) => {
    if (el.scrollTop || el.scrollLeft) {
      scrollPositions[getElementKey(el)] = {
        scrollTop: el.scrollTop,
        scrollLeft: el.scrollLeft,
      };
    }
  });
  return scrollPositions;
}
function restoreScrollPositions(scrollPositions) {
  document.querySelectorAll("*").forEach((el) => {
    const key = getElementKey(el);
    if (scrollPositions[key]) {
      el.scrollTop = scrollPositions[key].scrollTop;
      el.scrollLeft = scrollPositions[key].scrollLeft;
    }
  });
}
function getElementKey(el) {
  return el.id || el.className || el.tagName;
}
async function pphpFetch(url, options) {
  const data = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      "X-Requested-With": "XMLHttpRequest",
    },
  });
  return await data.text();
}
// Handle browser's back/forward navigation
window.addEventListener("popstate", async () => {
  try {
    const data = await pphpFetch(window.location.href);
    updateDocumentContent(data);
  } catch (error) {
    console.error("Navigation error:", error);
  }
});
function parseCallback(element, callback) {
  let data = {};
  // Check if the element is inside a form
  const form = element.closest("form");
  if (form) {
    // Serialize the form data
    const formData = new FormData(form);
    formData.forEach((value, key) => {
      if (data[key]) {
        // Handle multiple values
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    });
  } else {
    // Handle single input element
    if (element instanceof HTMLInputElement) {
      data = handleInputElement(element);
    } else if (element instanceof HTMLSelectElement) {
      data[element.name] = element.value;
    } else if (element instanceof HTMLTextAreaElement) {
      data[element.name] = element.value;
    }
  }
  // Parse function name and arguments from the callback string
  const match = callback.match(/(\w+)\((.*)\)/);
  if (match) {
    const funcName = match[1];
    let rawArgs = match[2].trim();
    if (rawArgs.startsWith("{") && rawArgs.endsWith("}")) {
      try {
        const parsedArg = parseJson(rawArgs);
        if (typeof parsedArg === "object" && parsedArg !== null) {
          data = { ...data, ...parsedArg };
        }
      } catch (e) {
        console.error("Error parsing JSON:", e);
      }
    } else {
      const args = rawArgs
        .split(/,(?=(?:[^'"]*['"][^'"]*['"])*[^'"]*$)/)
        .map((arg) => arg.trim().replace(/^['"]|['"]$/g, ""));
      data.args = args;
    }
    return { funcName, data };
  }
  return { funcName: callback, data };
}
function handleInputElement(element) {
  let data = {};
  // Only proceed if the element has a name
  if (element.name) {
    // Handle checkboxes
    if (element.type === "checkbox") {
      data[element.name] = {
        value: element.value,
        checked: element.checked,
      };
    } else if (element.type === "radio") {
      // Handle radio buttons
      const checkedRadio = document.querySelector(
        `input[name="${element.name}"]:checked`
      );
      data[element.name] = checkedRadio ? checkedRadio.value : null;
    } else {
      // Handle other input types
      data[element.name] = element.value;
    }
  } else {
    // Handle cases where the element does not have a name
    if (element.type === "checkbox" || element.type === "radio") {
      data.value = element.checked;
    } else {
      data.value = element.value;
    }
  }
  return data;
}
function updateElementAttributes(element, data) {
  for (const key in data) {
    if (!data.hasOwnProperty(key)) continue;
    switch (key) {
      case "innerHTML":
      case "outerHTML":
      case "textContent":
      case "innerText":
        element[key] = decodeHTML(data[key]);
        break;
      case "insertAdjacentHTML":
        element.insertAdjacentHTML(
          data.position || "beforeend",
          decodeHTML(data[key].html)
        );
        break;
      case "insertAdjacentText":
        element.insertAdjacentText(
          data.position || "beforeend",
          decodeHTML(data[key].text)
        );
        break;
      case "setAttribute":
        element.setAttribute(data.attrName, decodeHTML(data[key]));
        break;
      case "removeAttribute":
        element.removeAttribute(data[key]);
        break;
      case "className":
        element.className = decodeHTML(data[key]);
        break;
      case "classList.add":
        element.classList.add(...decodeHTML(data[key]).split(","));
        break;
      case "classList.remove":
        element.classList.remove(...decodeHTML(data[key]).split(","));
        break;
      case "classList.toggle":
        element.classList.toggle(decodeHTML(data[key]));
        break;
      case "classList.replace":
        const [oldClass, newClass] = decodeHTML(data[key]).split(",");
        element.classList.replace(oldClass, newClass);
        break;
      case "dataset":
        element.dataset[data.attrName] = decodeHTML(data[key]);
        break;
      case "style":
        Object.assign(element.style, data[key]);
        break;
      case "value":
        element.value = decodeHTML(data[key]);
        break;
      case "checked":
        element.checked = data[key];
        break;
      default:
        element.setAttribute(key, decodeHTML(data[key]));
    }
  }
}
function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}
async function handleSuspenseElement(element) {
  let suspenseElement = element.getAttribute("pp-suspense") || "";
  const handleFormElement = (form, data) => {
    for (const key in data) {
      if (!data.hasOwnProperty(key)) continue;
      for (const formElement of form.elements) {
        if (
          formElement instanceof HTMLInputElement ||
          formElement instanceof HTMLButtonElement ||
          formElement instanceof HTMLTextAreaElement ||
          formElement instanceof HTMLSelectElement
        ) {
          const suspenseElement = formElement.getAttribute("pp-suspense") || "";
          if (suspenseElement) {
            if (isJsonLike(suspenseElement)) {
              const suspenseData = parseJson(suspenseElement);
              if (suspenseData.onsubmit !== "disabled")
                updateElementAttributes(formElement, suspenseData);
            } else {
              updateElementTextContent(formElement, suspenseElement);
            }
          }
        }
      }
    }
  };
  const updateElementTextContent = (element, data) => {
    if (element instanceof HTMLInputElement) {
      element.value = data;
    } else {
      element.textContent = data;
    }
  };
  const handleTargetElement = (element, data) => {
    if (element instanceof HTMLFormElement) {
      handleFormElement(element, data);
    } else {
      updateElementAttributes(element, data);
    }
  };
  try {
    if (suspenseElement && isJsonLike(suspenseElement)) {
      const data = parseJson(suspenseElement);
      if (data) {
        if (element instanceof HTMLFormElement) {
          const formData = new FormData(element);
          const formDataToProcess = {};
          formData.forEach((value, key) => {
            formDataToProcess[key] = value;
          });
          if (data.disabled) {
            toggleFormElements(element, true);
          }
          const { disabled, ...restData } = data;
          updateElementAttributes(element, restData);
          handleFormElement(element, formDataToProcess);
        } else if (data.targets) {
          data.targets.forEach((target) => {
            const { id, ...rest } = target;
            const targetElement = document.querySelector(id);
            if (targetElement) {
              handleTargetElement(targetElement, rest);
            }
          });
          const { targets, ...restData } = data;
          updateElementAttributes(element, restData);
        } else {
          if (data.empty === "disabled" && element.value === "") return;
          const { empty, ...restData } = data;
          updateElementAttributes(element, restData);
        }
      }
    } else if (suspenseElement) {
      updateElementTextContent(element, suspenseElement);
    } else {
      if (element instanceof HTMLFormElement) {
        const formData = new FormData(element);
        const formDataToProcess = {};
        formData.forEach((value, key) => {
          formDataToProcess[key] = value;
        });
        handleFormElement(element, formDataToProcess);
      }
    }
  } catch (error) {
    console.error("🚀 ~ handleSuspenseElement ~ JSON parse error:", error);
  }
}
function parseJson(jsonString) {
  return JSON.parse(jsonString.replace(/'/g, '"'));
}
function toggleFormElements(form, disable) {
  Array.from(form.elements).forEach((element) => {
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLButtonElement ||
      element instanceof HTMLSelectElement ||
      element instanceof HTMLTextAreaElement
    ) {
      element.disabled = disable;
    }
  });
}
async function handleUndefinedFunction(element, funcName, data) {
  const body = {
    callback: funcName,
    ...data,
  };
  const firstFetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      HTTP_PPHP_WIRE_REQUEST: "true",
    },
    body: JSON.stringify(body),
  };
  const secondFetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      HTTP_PPHP_WIRE_REQUEST: "true",
    },
    body: JSON.stringify({ secondRequestC69CD: true }),
  };
  try {
    handleSuspenseElement(element);
    const targetOnlyAttribute = element.getAttribute("pp-target-only") || "";
    if (targetOnlyAttribute) {
      handlerTargetOnly(element, targetOnlyAttribute);
    }
    const url = window.location.pathname;
    const firstResponseText = await pphpFetch(url, firstFetchOptions);
    if (targetOnlyAttribute) return firstResponseText;
    const functionOnlyAttribute =
      element.getAttribute("pp-function-only") || "";
    handleFunctionOnly(functionOnlyAttribute, firstResponseText);
    if (functionOnlyAttribute) return firstResponseText;
    const secondResponseText = await pphpFetch(url, secondFetchOptions);
    if (firstResponseText.includes("redirect_7F834=")) {
      const url = firstResponseText.split("=")[1];
      await handleRedirect(url);
    } else {
      // Create a DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(secondResponseText, "text/html");
      const bodyContent = doc.body.innerHTML;
      const combinedHTML = firstResponseText + bodyContent;
      updateDocumentContent(combinedHTML);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
function handlerTargetOnly(element, functionOnlyAttribute) {
  if (!isJsonLike(functionOnlyAttribute)) return;
  const getTargetElement = (selector) => {
    if (selector.includes(" + ")) {
      const [baseSelector, siblingSelector] = selector.split(" + ");
      const baseElement = selectElement(baseSelector);
      if (baseElement) {
        const sibling = baseElement.nextElementSibling;
        if (sibling && sibling.matches(siblingSelector)) {
          return sibling;
        }
      }
      return null;
    } else {
      return selectElement(selector);
    }
  };
  const selectElement = (selector) => {
    if (selector.startsWith("#")) {
      const id = selector.slice(1);
      // Use attribute selector for IDs starting with digits
      return document.querySelector(`[id="${id}"]`);
    } else {
      return document.querySelector(selector);
    }
  };
  const applyActions = (target, actions) => {
    actions.forEach((action) => {
      const [method, ...subProps] = action.method.split(".");
      const value = action.value;
      if (subProps.length) {
        let propRef = target[method];
        for (let i = 0; i < subProps.length - 1; i++) {
          propRef = propRef[subProps[i]];
        }
        propRef[subProps[subProps.length - 1]] = value;
      } else {
        target[method] = value;
      }
    });
  };
  const handleClasses = (target, classes, conditionMet) => {
    if (conditionMet) {
      if (classes.add) target.classList.add(...classes.add.split(" "));
      if (classes.remove) target.classList.remove(...classes.remove.split(" "));
    } else {
      if (classes.add) target.classList.remove(...classes.add.split(" "));
      if (classes.remove) target.classList.add(...classes.remove.split(" "));
    }
  };
  const checkCondition = (element, condition) => {
    switch (condition) {
      case "checked":
        return element.checked;
      case "focus":
        return element === document.activeElement;
      // Add more conditions as needed
      default:
        return false;
    }
  };
  const targetOnlyData = parseJson(functionOnlyAttribute);
  targetOnlyData.targets.forEach((targetData) => {
    const targetElement = getTargetElement(targetData.id);
    if (targetElement) {
      const conditionMet = targetData.this.condition
        ? checkCondition(element, targetData.this.condition)
        : false;
      const classList = targetData.this.classList;
      const rest = { ...targetData.this };
      if (classList) handleClasses(targetElement, classList, conditionMet);
      Object.keys(rest).forEach((key) => {
        if (key !== "id" && key !== "condition" && key !== "classList") {
          const value = rest[key];
          if (typeof targetElement[key] === "function") {
            targetElement[key](value);
          } else {
            targetElement[key] = value;
          }
        }
      });
      if (targetOnlyData.actions) {
        applyActions(targetElement, targetOnlyData.actions);
      }
    } else {
      console.error(`Invalid selector: ${targetData.id}`);
    }
  });
}
function handleFunctionOnly(functionOnlyAttribute, firstResponseText) {
  if (!isJsonLike(functionOnlyAttribute)) return;
  const functionOnlyData = parseJson(functionOnlyAttribute);
  const responseData = firstResponseText ? parseJson(firstResponseText) : null;
  const targets = functionOnlyData.targets; // Assuming targets is an array of objects
  if (Array.isArray(targets)) {
    targets.forEach((targetData) => {
      const { id, ...restData } = targetData;
      const targetToProcess = document.querySelector(id);
      let targetAttributes = {};
      if (responseData) {
        for (const key in restData) {
          if (restData.hasOwnProperty(key)) {
            switch (key) {
              case "innerHTML":
              case "outerHTML":
              case "textContent":
              case "innerText":
                if (restData[key] === "response") {
                  targetAttributes[key] = targetData.responseKey
                    ? responseData[targetData.responseKey]
                    : responseData.response;
                }
                break;
              default:
                targetAttributes[key] = restData[key];
                break;
            }
          }
        }
      } else {
        targetAttributes = restData;
      }
      if (targetToProcess) {
        updateElementAttributes(targetToProcess, targetAttributes);
      }
    });
  }
}
// Function to handle redirection without a full page reload
async function handleRedirect(url) {
  if (!url) return;
  // Use history.pushState to change the URL without a full refresh
  history.pushState(null, "", url);
  window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
  // Fetch the new content via AJAX
  try {
    const response = await fetch(url, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    const data = await response.text();
    updateDocumentContent(data);
  } catch (error) {
    console.error("Redirect error:", error);
  }
}
/**
 * Debounces a function to limit the rate at which it is called.
 *
 * The debounced function will postpone its execution until after the specified wait time
 * has elapsed since the last time it was invoked. If `immediate` is `true`, the function
 * will be called at the beginning of the wait period instead of at the end.
 *
 * @param {Function} func - The function to debounce.
 * @param {number} [wait=300] - The number of milliseconds to wait before invoking the function.
 * @param {boolean} [immediate=false] - If `true`, the function is invoked immediately on the leading edge.
 * @returns {Function} - Returns the debounced version of the original function.
 */
function debounce(func, wait = 300, immediate = false) {
  let timeout;
  return function (...args) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) {
      func.apply(context, args);
    }
  };
}
/**
 * Copies code to the clipboard and updates the button icon.
 *
 * @param {HTMLElement} btnElement - The button element that triggered the copy action.
 * @param {string} containerClass - The class of the container element that contains the code block.
 * @param {string} initialIconClass - The initial class for the icon.
 * @param {string} successIconClass - The class for the icon after a successful copy.
 * @param {number} [timeout=2000] - The time in milliseconds to revert to the initial icon class.
 */
function copyCode(
  btnElement,
  containerClass,
  initialIconClass,
  successIconClass,
  timeout = 2000
) {
  // Find the closest container with the specified class relative to the button
  const codeBlock = btnElement
    .closest(`.${containerClass}`)
    ?.querySelector("pre code");
  const textToCopy = codeBlock?.textContent?.trim() || ""; // Get the text content of the code block and trim whitespace
  if (textToCopy) {
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        // Clipboard successfully set
        const icon = btnElement.querySelector("i");
        if (icon) {
          icon.className = successIconClass; // Change to success icon
        }
        // Set a timeout to change the icon back to initial after the specified timeout
        setTimeout(() => {
          if (icon) {
            icon.className = initialIconClass; // Change back to initial icon
          }
        }, timeout); // Timeout delay
      },
      () => {
        // Clipboard write failed
        alert("Failed to copy command to clipboard");
      }
    );
  } else {
    alert("Failed to find the code block to copy");
  }
}
let store = null;
if (typeof store === "undefined") {
  class StateManager {
    static instance = null;
    state;
    listeners;
    /**
     * Creates a new StateManager instance.
     *
     * @param {State} [initialState={}] - The initial state.
     */
    constructor(initialState = {}) {
      this.state = initialState;
      this.listeners = [];
    }
    /**
     * Gets the singleton instance of StateManager.
     *
     * @param {State} [initialState={}] - The initial state.
     * @returns {StateManager} - The StateManager instance.
     */
    static getInstance(initialState = {}) {
      if (!StateManager.instance) {
        StateManager.instance = new StateManager(initialState);
        StateManager.instance.loadState(); // Load state immediately after instance creation
      }
      return StateManager.instance;
    }
    /**
     * Sets the state.
     *
     * @param {Partial<State>} update - The state update.
     * @param {boolean} [saveToStorage=false] - Whether to save the state to localStorage.
     */
    setState(update, saveToStorage = false) {
      this.state = { ...this.state, ...update };
      this.listeners.forEach((listener) => listener(this.state));
      if (saveToStorage) {
        this.saveState();
      }
    }
    /**
     * Subscribes to state changes.
     *
     * @param {(state: State) => void} listener - The listener function.
     * @returns {() => void} - A function to unsubscribe the listener.
     */
    subscribe(listener) {
      this.listeners.push(listener);
      listener(this.state); // Immediately invoke the listener with the current state
      return () => {
        this.listeners = this.listeners.filter((l) => l !== listener);
      };
    }
    /**
     * Saves the state to localStorage.
     */
    saveState() {
      localStorage.setItem("appState", JSON.stringify(this.state));
    }
    /**
     * Loads the state from localStorage.
     */
    loadState() {
      const state = localStorage.getItem("appState");
      if (state) {
        this.state = JSON.parse(state);
        this.listeners.forEach((listener) => listener(this.state));
      }
    }
    /**
     * Resets the state to its initial value.
     *
     * @param {boolean} [clearFromStorage=false] - Whether to clear the state from localStorage.
     */
    resetState(clearFromStorage = false) {
      this.state = {}; // Reset the state to an empty object or a default state if you prefer
      this.listeners.forEach((listener) => listener(this.state));
      if (clearFromStorage) {
        localStorage.removeItem("appState"); // Clear the state from localStorage
      }
    }
  }
  store = StateManager.getInstance();
}
