// Runs at document_start in MAIN world, before Khan Academy's scripts load.
// Patches addEventListener so Khan's keydown/paste blockers are wrapped —
// when our extension is enabled, we suppress their prevention of Ctrl+V.

(function () {
  const _addEventListener = EventTarget.prototype.addEventListener;
  const _removeEventListener = EventTarget.prototype.removeEventListener;
  const wrappedHandlers = new WeakMap();

  function isBlocking(type) {
    return type === "keydown" || type === "paste";
  }

  EventTarget.prototype.addEventListener = function (type, handler, options) {
    if (!isBlocking(type) || typeof handler !== "function") {
      return _addEventListener.call(this, type, handler, options);
    }

    // Wrap the handler: if our extension is enabled and it's a paste/ctrl+v
    // keydown, run the handler in a context where preventDefault/stopPropagation are neutered.
    function wrappedHandler(e) {
      const enabled = document.documentElement.dataset.codehsPaster === "on";
      if (!enabled) {
        return handler.call(this, e);
      }

      const isCtrlV = type === "keydown" && (e.ctrlKey || e.metaKey) && e.key === "v";
      const isPaste = type === "paste";

      if (isCtrlV || isPaste) {
        // Let our content.js handle it; neuter this site handler
        const noop = () => {};
        const fakeEvent = new Proxy(e, {
          get(target, prop) {
            if (prop === "preventDefault" || prop === "stopPropagation" || prop === "stopImmediatePropagation") {
              return noop;
            }
            const val = target[prop];
            return typeof val === "function" ? val.bind(target) : val;
          }
        });
        handler.call(this, fakeEvent);
      } else {
        handler.call(this, e);
      }
    }

    wrappedHandlers.set(handler, wrappedHandler);
    return _addEventListener.call(this, type, wrappedHandler, options);
  };

  EventTarget.prototype.removeEventListener = function (type, handler, options) {
    const wrapped = wrappedHandlers.get(handler);
    return _removeEventListener.call(this, type, wrapped ?? handler, options);
  };
})();
