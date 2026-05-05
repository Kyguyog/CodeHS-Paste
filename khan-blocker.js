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

    function wrappedHandler(e) {
      const enabled = document.documentElement.dataset.codehsPaster === "on";
      if (!enabled) {
        return handler.call(this, e);
      }

      const isCtrlV = type === "keydown" && (e.ctrlKey || e.metaKey) && e.key === "v";
      const isPaste = type === "paste";

      if (isCtrlV || isPaste) {
        return; // Silently drop it — content.js handles the actual paste
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
