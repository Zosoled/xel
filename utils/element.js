
// @copyright
//   © 2016-2017 Jarosław Foksa

let templateElement = document.createElement("template");

// @info
//   Template string tag used to parse HTML strings.
// @type
//   () => HTMLElement || DocumentFragment
export let html = (strings, ...expressions) => {
  let parts = [];

  for (let i = 0; i < strings.length; i += 1) {
    parts.push(strings[i]);
    if (expressions[i] !== undefined) parts.push(expressions[i]);
  }

  let innerHTML = parts.join("");
  templateElement.innerHTML = innerHTML;
  let fragment = document.importNode(templateElement.content, true);

  if (fragment.children.length === 1) {
    return fragment.firstElementChild;
  }
  else {
    return fragment;
  }
}

// @info
//   Template string tag used to parse SVG strings.
// @type
//   () => SVGElement || DocumentFragment
export let svg = (strings, ...expressions) => {
  let parts = [];

  for (let i = 0; i < strings.length; i += 1) {
    parts.push(strings[i]);
    if (expressions[i] !== undefined) parts.push(expressions[i]);
  }

  let innerHTML = `<svg id="x-stub" xmlns="http://www.w3.org/2000/svg">${parts.join("")}</svg>`;

  templateElement.innerHTML = innerHTML;

  let fragment = document.importNode(templateElement.content, true);
  let stub = fragment.querySelector("svg#x-stub");

  if (stub.children.length === 1) {
    return stub.firstElementChild;
  }
  else {
    for (let child of [...stub.childNodes]) {
      fragment.appendChild(child);
    }

    stub.remove();
    return fragment;
  }
}

// @info
//   Same as document.createElement(), but you can also create SVG elements.
// @type
//   (string) => Element?
export let createElement = (name, is = null) => {
  let parts = name.split(":");
  let element = null;

  if (parts.length === 1) {
    let [localName] = parts;

    if (is === null) {
      element = document.createElement(localName);
    }
    else {
      element = document.createElement(localName, is);
    }
  }
  else if (parts.length === 2) {
    let [namespace, localName] = parts;

    if (namespace === "svg") {
      element = document.createElementNS("http://www.w3.org/2000/svg", localName);
    }
  }

  return element;
};

// @info
//   Same as the standard document.elementFromPoint() moethod, but can also walk the shadow DOM.
// @type
//   (number, number, boolea) => Element?
let elementFromPoint = (clientX, clientY, walkShadowDOM = true) => {
  let element = document.elementFromPoint(clientX, clientY);

  if (walkShadowDOM && element) {
    while (true) {
      let shadowRoot = (element.shadowRoot || element._shadowRoot);

      if (shadowRoot) {
        let descendantElement = shadowRoot.elementFromPoint(clientX, clientY);

        // @bugfix: https://bugs.chromium.org/p/chromium/issues/detail?id=843215
        if (descendantElement.getRootNode() !== shadowRoot) {
          descendantElement = null;
        }

        if (descendantElement && descendantElement !== element) {
          element = descendantElement;
        }
        else {
          break;
        }
      }
      else {
        break;
      }
    }
  }

  return element;
};

// @info
//   Same as the standard element.closest() method but can also walk the shadow DOM.
// @type
//   (Element, string, boolean) => Element?
export let closest = (element, selector, walkShadowDOM = true) => {
  let matched = element.closest(selector);

  if (walkShadowDOM && !matched && element.getRootNode().host) {
    return closest(element.getRootNode().host, selector);
  }
  else {
    return matched;
  }
};

// @info
//   Generate element ID that is unique in the given document fragment.
// @type
//   (DocumentFragment, string) => string
export let generateUniqueID = (fragment, prefix = "") => {
  let counter = 1;

  while (true) {
    let id = prefix + counter;

    if (fragment.querySelector("#" + CSS.escape(id)) === null) {
      return id;
    }
    else {
      counter += 1;
    }
  }
};
