// VIP subscription.
// In the Play Store app it uses Google Play Billing through cordova-plugin-purchase (window.CdvPurchase).
// On the web there is no way to pay, so VIP can be switched on for free as a demo.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var KEY = 'companysim_vip_v1';
  var PRODUCT = 'vip_monthly'; // must match the subscription id you create in Google Play Console
  var state = { vip: false, native: false, ready: false, price: '$2.99 / month', busy: false, error: '' };
  var listeners = [];

  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function write(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function set(v) {
    if (state.vip === v) return;
    state.vip = v;
    write({ vip: v });
    listeners.forEach(function (f) { try { f(); } catch (e) {} });
  }
  state.vip = !!read().vip;

  function isNative() { return !!(globalThis.Capacitor && globalThis.Capacitor.isNativePlatform && globalThis.Capacitor.isNativePlatform()); }

  CS.Store = {
    PRODUCT: PRODUCT,
    isVIP: function () { return state.vip; },
    info: function () { return state; },
    onChange: function (f) { listeners.push(f); },

    init: function () {
      var P = globalThis.CdvPurchase;
      if (state.native) return; // already set up
      if (!isNative() || !P) { state.ready = true; return; }
      state.native = true;
      var store = P.store;
      store.register([{ id: PRODUCT, type: P.ProductType.PAID_SUBSCRIPTION, platform: P.Platform.GOOGLE_PLAY }]);
      store.when()
        .approved(function (t) { t.verify(); })
        .verified(function (r) { r.finish(); refresh(); })
        .productUpdated(refresh)
        .receiptUpdated(refresh);
      store.error(function (err) { state.error = err && err.message || 'Store error'; });
      store.initialize([P.Platform.GOOGLE_PLAY]).then(function () { state.ready = true; refresh(); });
      function refresh() {
        var p = store.get(PRODUCT, P.Platform.GOOGLE_PLAY);
        if (!p) return;
        var offer = p.getOffer && p.getOffer();
        var phase = offer && offer.pricingPhases && offer.pricingPhases[offer.pricingPhases.length - 1];
        if (phase && phase.price) state.price = phase.price + ' / month';
        set(!!store.owned(p));
      }
      CS.Store._refresh = refresh;
    },

    // Starts the purchase. Resolves to true when VIP is active.
    buy: function () {
      if (!state.native) { set(true); return Promise.resolve(true); } // web demo
      var P = globalThis.CdvPurchase, store = P.store;
      var p = store.get(PRODUCT, P.Platform.GOOGLE_PLAY), offer = p && p.getOffer();
      if (!offer) { state.error = 'VIP is not available right now. Try again later.'; return Promise.resolve(false); }
      state.busy = true;
      return offer.order().then(function (err) {
        state.busy = false;
        if (err) { state.error = err.message || 'Purchase cancelled.'; return false; }
        return state.vip;
      });
    },

    restore: function () {
      if (!state.native) return Promise.resolve(state.vip);
      var store = globalThis.CdvPurchase.store;
      return store.restorePurchases().then(function () { if (CS.Store._refresh) CS.Store._refresh(); return state.vip; });
    },

    // Web demo only: turn VIP off again.
    demoOff: function () { if (!state.native) set(false); }
  };
})();
