/**
 * JSX Factory Runtime
 * Creates real DOM elements from JSX syntax without React
 */

type JSXChild = Element | string | number | boolean | null | undefined;

// Global JSX namespace for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

/**
 * Creates a DOM element from JSX
 */
export function jsx(
  tag: string | Function,
  props: { [key: string]: any } | null,
  ...children: JSXChild[]
): Element {
  if (typeof tag === 'function') {
    return tag(props, children);
  }

  const element = document.createElement(tag);

  // Set properties and attributes
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'class') {
        element.className = value;
      } else if (key.startsWith('on') && typeof value === 'function') {
        // Event handlers
        const eventName = key.substring(2).toLowerCase();
        element.addEventListener(eventName, value);
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key === 'dangerouslySetInnerHTML') {
        element.innerHTML = value.__html;
      } else if (value !== false && value !== null && value !== undefined) {
        element.setAttribute(key, value.toString());
      }
    }
  }

  // Append children
  const appendChildren = (parent: Element, children: JSXChild[]) => {
    for (const child of children) {
      if (child === null || child === undefined || child === false || child === true) {
        continue;
      }
      
      if (Array.isArray(child)) {
        appendChildren(parent, child);
      } else if (child instanceof Element) {
        parent.appendChild(child);
      } else {
        parent.appendChild(document.createTextNode(String(child)));
      }
    }
  };

  appendChildren(element, children);
  return element;
}

// Alias for compatibility
export const jsxs = jsx;
export const Fragment = (props: { children: JSXChild[] }) => {
  const fragment = document.createDocumentFragment();
  const appendChildren = (parent: DocumentFragment, children: JSXChild[]) => {
    for (const child of children) {
      if (child === null || child === undefined || child === false || child === true) {
        continue;
      }
      
      if (Array.isArray(child)) {
        appendChildren(parent, child);
      } else if (child instanceof Element) {
        parent.appendChild(child);
      } else {
        parent.appendChild(document.createTextNode(String(child)));
      }
    }
  };
  appendChildren(fragment, props.children || []);
  return fragment;
};
