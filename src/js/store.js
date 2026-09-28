// Real-money shop: the VIP Pass, a Starter Pack, cash packs and war energy.
// In the Play Store app it uses Google Play Billing through cordova-plugin-purchase (window.CdvPurchase).
// The product ids below must match the products you create in Google Play Console (see PLAYSTORE.md).
// Prices come from Google Play, so they show in the player's own currency. The ones here are only shown
// until Google answers.
// On the web there is no way to pay, so the shop only explains that buying works in the Android app.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var KEY = 'companysim_vip_v1', GRANTS = 'companysim_grants_v1', DONE = 'companysim_tx_v1';
  // forever = bought once, kept forever. use = used up when bought (you can buy it again).
  var PRODUCTS = [
    { key: 'vip', id: 'vip_pass', kind: 'forever', price: '$9.99' },
    { key: 'starter', id: 'starter_pack', kind: 'forever', price: '$2.99' },
    { key: 'cash_s', id: 'cash_small', kind: 'use', price: '$0.99' },
    { key: 'cash_m', id: 'cash_medium', kind: 'use', price: '$4.99' },
    { key: 'cash_l', id: 'cash_large', kind: 'use', price: '$9.99' },
    { key: 'energy', id: 'war_energy', kind: 'use', price: '$0.99' }
  ];
  var OLD_SUB = 'vip_monthly'; // earlier versions sold VIP as a subscription: people who have it keep VIP
  var state = { vip: false, native: false, ready: false, busy: false, error: '', owned: {}, prices: {} };
  var listeners = [], grantListeners = [];

  function read(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function changed() { listeners.forEach(function (f) { try { f(); } catch (e) {} }); }
  function setVip(v) {
    if (state.vip === v) return;
    state.vip = v; write(KEY, { vip: v }); changed();
  }
  // A reward waits here until a company is open to receive it (so nothing is lost if you buy on the menu).
  function queueGrant(key) {
    write(GRANTS, read(GRANTS, []).concat([key]));
    grantListeners.forEach(function (f) { try { f(key); } catch (e) {} });
  }
  state.vip = !!read(KEY, {}).vip;
  var byId = {}; PRODUCTS.forEach(function (p) { byId[p.id] = p; });

  function isNative() { return !!(globalThis.Capacitor && globalThis.Capacitor.isNativePlatform && globalThis.Capacitor.isNativePlatform()); }

  CS.Store = {
    PRODUCTS: PRODUCTS,
    isVIP: function () { return state.vip; },
    info: function () { return state; },
    owns: function (key) { return key === 'vip' ? state.vip : !!state.owned[key]; },
    price: function (key) { var p = PRODUCTS.find(function (x) { return x.key === key; }); return state.prices[key] || (p && p.price) || ''; },
    onChange: function (f) { listeners.push(f); },
    onGrant: function (f) { grantListeners.push(f); },
    // Rewards bought but not given to a company yet. Taking them empties the list.
    takeGrants: function () { var g = read(GRANTS, []); write(GRANTS, []); return g; },
    hasGrants: function () { return read(GRANTS, []).length > 0; },

    init: function () {
      var P = globalThis.CdvPurchase;
      if (state.native) return;
      if (!isNative() || !P) { state.ready = true; return; }
      state.native = true;
      var store = P.store, GP = P.Platform.GOOGLE_PLAY;
      store.register(PRODUCTS.map(function (p) {
        return { id: p.id, type: p.kind === 'use' ? P.ProductType.CONSUMABLE : P.ProductType.NON_CONSUMABLE, platform: GP };
      }).concat([{ id: OLD_SUB, type: P.ProductType.PAID_SUBSCRIPTION, platform: GP }]));
      store.when()
        .approved(function (t) { t.verify(); })
        .verified(function (r) { r.finish(); })
        .finished(function (t) {
          // Cash packs and energy are given once per purchase, even if Google tells us twice.
          var done = read(DONE, []);
          if (t.transactionId && done.indexOf(t.transactionId) >= 0) return;
          var gave = false;
          (t.products || []).forEach(function (pr) { var p = byId[pr.id]; if (p && p.kind === 'use') { queueGrant(p.key); gave = true; } });
          if (gave && t.transactionId) write(DONE, done.concat([t.transactionId]).slice(-200));
          refresh();
        })
        .productUpdated(refresh)
        .receiptUpdated(refresh);
      store.error(function (err) { state.error = err && err.message || 'Store error'; changed(); });
      store.initialize([GP]).then(function () { state.ready = true; refresh(); });
      function refresh() {
        PRODUCTS.forEach(function (p) {
          var pr = store.get(p.id, GP);
          if (!pr) return;
          var offer = pr.getOffer && pr.getOffer(), ph = offer && offer.pricingPhases && offer.pricingPhases[0];
          var price = (pr.pricing && pr.pricing.price) || (ph && ph.price);
          if (price) state.prices[p.key] = price;
          if (p.kind === 'forever') state.owned[p.key] = !!store.owned(pr);
        });
        // The Starter Pack's rewards are given once, the first time we see it's owned.
        if (state.owned.starter && !read('companysim_starter_given', false)) { write('companysim_starter_given', true); queueGrant('starter'); }
        var sub = store.get(OLD_SUB, GP);
        setVip(!!state.owned.vip || !!(sub && store.owned(sub)));
        changed();
      }
      CS.Store._refresh = refresh;
    },

    // Starts a purchase. Resolves to true when it went through.
    buy: function (key) {
      key = key || 'vip';
      if (!state.native) { state.error = 'Buying only works in the Company Simulator app from Google Play.'; changed(); return Promise.resolve(false); }
      var P = globalThis.CdvPurchase, store = P.store, p = PRODUCTS.find(function (x) { return x.key === key; });
      var pr = p && store.get(p.id, P.Platform.GOOGLE_PLAY), offer = pr && pr.getOffer();
      if (!offer) { state.error = 'This is not available right now. Try again later.'; changed(); return Promise.resolve(false); }
      state.busy = true; state.error = ''; changed();
      return offer.order().then(function (err) {
        state.busy = false;
        if (err) { state.error = err.code === P.ErrorCode.PAYMENT_CANCELLED ? '' : (err.message || 'The purchase did not go through.'); changed(); return false; }
        changed();
        return true;
      });
    },

    restore: function () {
      if (!state.native) return Promise.resolve(state.vip);
      var store = globalThis.CdvPurchase.store;
      return store.restorePurchases().then(function () { if (CS.Store._refresh) CS.Store._refresh(); return state.vip; });
    },

    // For automated tests on the web only (not reachable from the game).
    _demo: function (key) { if (state.native) return; if (key === 'vip') setVip(true); else if (key === 'novip') setVip(false); else { if (key === 'starter') state.owned.starter = true; queueGrant(key); changed(); } }
  };
})();
