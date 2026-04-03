const noop = () => {};

Object.defineProperty(window, 'alert', {
  configurable: true,
  writable: true,
  value: noop,
});

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  configurable: true,
  writable: true,
  value: noop,
});
