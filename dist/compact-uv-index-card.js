/*! compact-uv-index-card 1.1.0 | MIT License */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i5 = decorators.length - 1, decorator; i5 >= 0; i5--)
    if (decorator = decorators[i5])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t4, e5, o6) {
    if (this._$cssResult$ = true, o6 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t4, this.t = e5;
  }
  get styleSheet() {
    let t4 = this.o;
    const s4 = this.t;
    if (e && void 0 === t4) {
      const e5 = void 0 !== s4 && 1 === s4.length;
      e5 && (t4 = o.get(s4)), void 0 === t4 && ((this.o = t4 = new CSSStyleSheet()).replaceSync(this.cssText), e5 && o.set(s4, t4));
    }
    return t4;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t4) => new n("string" == typeof t4 ? t4 : t4 + "", void 0, s);
var i = (t4, ...e5) => {
  const o6 = 1 === t4.length ? t4[0] : e5.reduce((e6, s4, o7) => e6 + ((t5) => {
    if (true === t5._$cssResult$) return t5.cssText;
    if ("number" == typeof t5) return t5;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t5 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t4[o7 + 1], t4[0]);
  return new n(o6, t4, s);
};
var S = (s4, o6) => {
  if (e) s4.adoptedStyleSheets = o6.map((t4) => t4 instanceof CSSStyleSheet ? t4 : t4.styleSheet);
  else for (const e5 of o6) {
    const o7 = document.createElement("style"), n5 = t.litNonce;
    void 0 !== n5 && o7.setAttribute("nonce", n5), o7.textContent = e5.cssText, s4.appendChild(o7);
  }
};
var c = e ? (t4) => t4 : (t4) => t4 instanceof CSSStyleSheet ? ((t5) => {
  let e5 = "";
  for (const s4 of t5.cssRules) e5 += s4.cssText;
  return r(e5);
})(t4) : t4;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t4, s4) => t4;
var u = { toAttribute(t4, s4) {
  switch (s4) {
    case Boolean:
      t4 = t4 ? l : null;
      break;
    case Object:
    case Array:
      t4 = null == t4 ? t4 : JSON.stringify(t4);
  }
  return t4;
}, fromAttribute(t4, s4) {
  let i5 = t4;
  switch (s4) {
    case Boolean:
      i5 = null !== t4;
      break;
    case Number:
      i5 = null === t4 ? null : Number(t4);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t4);
      } catch (t5) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t4, s4) => !i2(t4, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ?? (Symbol.metadata = /* @__PURE__ */ Symbol("metadata")), a.litPropertyMetadata ?? (a.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
var y = class extends HTMLElement {
  static addInitializer(t4) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t4);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t4, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t4) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t4, s4), !s4.noAccessor) {
      const i5 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t4, i5, s4);
      void 0 !== h3 && e2(this.prototype, t4, h3);
    }
  }
  static getPropertyDescriptor(t4, s4, i5) {
    const { get: e5, set: r6 } = h(this.prototype, t4) ?? { get() {
      return this[s4];
    }, set(t5) {
      this[s4] = t5;
    } };
    return { get: e5, set(s5) {
      const h3 = e5?.call(this);
      r6?.call(this, s5), this.requestUpdate(t4, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t4) {
    return this.elementProperties.get(t4) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t4 = n2(this);
    t4.finalize(), void 0 !== t4.l && (this.l = [...t4.l]), this.elementProperties = new Map(t4.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t5 = this.properties, s4 = [...r2(t5), ...o2(t5)];
      for (const i5 of s4) this.createProperty(i5, t5[i5]);
    }
    const t4 = this[Symbol.metadata];
    if (null !== t4) {
      const s4 = litPropertyMetadata.get(t4);
      if (void 0 !== s4) for (const [t5, i5] of s4) this.elementProperties.set(t5, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t5, s4] of this.elementProperties) {
      const i5 = this._$Eu(t5, s4);
      void 0 !== i5 && this._$Eh.set(i5, t5);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i5 = [];
    if (Array.isArray(s4)) {
      const e5 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e5) i5.unshift(c(s5));
    } else void 0 !== s4 && i5.push(c(s4));
    return i5;
  }
  static _$Eu(t4, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t4 ? t4.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t4) => t4(this));
  }
  addController(t4) {
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t4), void 0 !== this.renderRoot && this.isConnected && t4.hostConnected?.();
  }
  removeController(t4) {
    this._$EO?.delete(t4);
  }
  _$E_() {
    const t4 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t4.set(i5, this[i5]), delete this[i5]);
    t4.size > 0 && (this._$Ep = t4);
  }
  createRenderRoot() {
    const t4 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t4, this.constructor.elementStyles), t4;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this._$EO?.forEach((t4) => t4.hostConnected?.());
  }
  enableUpdating(t4) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t4) => t4.hostDisconnected?.());
  }
  attributeChangedCallback(t4, s4, i5) {
    this._$AK(t4, i5);
  }
  _$ET(t4, s4) {
    const i5 = this.constructor.elementProperties.get(t4), e5 = this.constructor._$Eu(t4, i5);
    if (void 0 !== e5 && true === i5.reflect) {
      const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t4, null == h3 ? this.removeAttribute(e5) : this.setAttribute(e5, h3), this._$Em = null;
    }
  }
  _$AK(t4, s4) {
    const i5 = this.constructor, e5 = i5._$Eh.get(t4);
    if (void 0 !== e5 && this._$Em !== e5) {
      const t5 = i5.getPropertyOptions(e5), h3 = "function" == typeof t5.converter ? { fromAttribute: t5.converter } : void 0 !== t5.converter?.fromAttribute ? t5.converter : u;
      this._$Em = e5;
      const r6 = h3.fromAttribute(s4, t5.type);
      this[e5] = r6 ?? this._$Ej?.get(e5) ?? r6, this._$Em = null;
    }
  }
  requestUpdate(t4, s4, i5, e5 = false, h3) {
    if (void 0 !== t4) {
      const r6 = this.constructor;
      if (false === e5 && (h3 = this[t4]), i5 ?? (i5 = r6.getPropertyOptions(t4)), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t4) && !this.hasAttribute(r6._$Eu(t4, i5)))) return;
      this.C(t4, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t4, s4, { useDefault: i5, reflect: e5, wrapped: h3 }, r6) {
    i5 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t4) && (this._$Ej.set(t4, r6 ?? s4 ?? this[t4]), true !== h3 || void 0 !== r6) || (this._$AL.has(t4) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t4, s4)), true === e5 && this._$Em !== t4 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t4));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t5) {
      Promise.reject(t5);
    }
    const t4 = this.scheduleUpdate();
    return null != t4 && await t4, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [t6, s5] of this._$Ep) this[t6] = s5;
        this._$Ep = void 0;
      }
      const t5 = this.constructor.elementProperties;
      if (t5.size > 0) for (const [s5, i5] of t5) {
        const { wrapped: t6 } = i5, e5 = this[s5];
        true !== t6 || this._$AL.has(s5) || void 0 === e5 || this.C(s5, void 0, i5, e5);
      }
    }
    let t4 = false;
    const s4 = this._$AL;
    try {
      t4 = this.shouldUpdate(s4), t4 ? (this.willUpdate(s4), this._$EO?.forEach((t5) => t5.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t4 = false, this._$EM(), s5;
    }
    t4 && this._$AE(s4);
  }
  willUpdate(t4) {
  }
  _$AE(t4) {
    this._$EO?.forEach((t5) => t5.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t4)), this.updated(t4);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t4) {
    return true;
  }
  update(t4) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t5) => this._$ET(t5, this[t5]))), this._$EM();
  }
  updated(t4) {
  }
  firstUpdated(t4) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ?? (a.reactiveElementVersions = [])).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t4) => t4;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t4) => t4 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t4) => null === t4 || "object" != typeof t4 && "function" != typeof t4;
var u2 = Array.isArray;
var d2 = (t4) => u2(t4) || "function" == typeof t4?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t4) => (i5, ...s4) => ({ _$litType$: t4, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t4, i5) {
  if (!u2(t4) || !t4.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
var N = (t4, i5) => {
  const s4 = t4.length - 1, e5 = [];
  let n5, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t4[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n5 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n5 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n5 = void 0);
    const x2 = c4 === p2 && t4[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e5.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
  }
  return [V(t4, l3 + (t4[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e5];
};
var S2 = class _S {
  constructor({ strings: t4, _$litType$: i5 }, e5) {
    let r6;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t4.length - 1, d3 = this.parts, [f3, v2] = N(t4, i5);
    if (this.el = _S.createElement(f3, e5), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t5 = this.el.content.firstChild;
      t5.replaceWith(...t5.childNodes);
    }
    for (; null !== (r6 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r6.nodeType) {
        if (r6.hasAttributes()) for (const t5 of r6.getAttributeNames()) if (t5.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r6.getAttribute(t5).split(o3), e6 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e6[2], strings: s4, ctor: "." === e6[1] ? I : "?" === e6[1] ? L : "@" === e6[1] ? z : H }), r6.removeAttribute(t5);
        } else t5.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r6.removeAttribute(t5));
        if (y2.test(r6.tagName)) {
          const t5 = r6.textContent.split(o3), i6 = t5.length - 1;
          if (i6 > 0) {
            r6.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r6.append(t5[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r6.append(t5[i6], c3());
          }
        }
      } else if (8 === r6.nodeType) if (r6.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t5 = -1;
        for (; -1 !== (t5 = r6.data.indexOf(o3, t5 + 1)); ) d3.push({ type: 7, index: l3 }), t5 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t4, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t4, s4;
  }
};
function M(t4, i5, s4 = t4, e5) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e5 ? s4._$Co?.[e5] : s4._$Cl;
  const o6 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o6 && (h3?._$AO?.(false), void 0 === o6 ? h3 = void 0 : (h3 = new o6(t4), h3._$AT(t4, s4, e5)), void 0 !== e5 ? (s4._$Co ?? (s4._$Co = []))[e5] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t4, h3._$AS(t4, i5.values), h3, e5)), i5;
}
var R = class {
  constructor(t4, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t4, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t4) {
    const { el: { content: i5 }, parts: s4 } = this._$AD, e5 = (t4?.creationScope ?? l2).importNode(i5, true);
    P.currentNode = e5;
    let h3 = P.nextNode(), o6 = 0, n5 = 0, r6 = s4[0];
    for (; void 0 !== r6; ) {
      if (o6 === r6.index) {
        let i6;
        2 === r6.type ? i6 = new k(h3, h3.nextSibling, this, t4) : 1 === r6.type ? i6 = new r6.ctor(h3, r6.name, r6.strings, this, t4) : 6 === r6.type && (i6 = new Z(h3, this, t4)), this._$AV.push(i6), r6 = s4[++n5];
      }
      o6 !== r6?.index && (h3 = P.nextNode(), o6++);
    }
    return P.currentNode = l2, e5;
  }
  p(t4) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t4, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t4[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t4, i5, s4, e5) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t4, this._$AB = i5, this._$AM = s4, this.options = e5, this._$Cv = e5?.isConnected ?? true;
  }
  get parentNode() {
    let t4 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === t4?.nodeType && (t4 = i5.parentNode), t4;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t4, i5 = this) {
    t4 = M(this, t4, i5), a2(t4) ? t4 === A || null == t4 || "" === t4 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t4 !== this._$AH && t4 !== E && this._(t4) : void 0 !== t4._$litType$ ? this.$(t4) : void 0 !== t4.nodeType ? this.T(t4) : d2(t4) ? this.k(t4) : this._(t4);
  }
  O(t4) {
    return this._$AA.parentNode.insertBefore(t4, this._$AB);
  }
  T(t4) {
    this._$AH !== t4 && (this._$AR(), this._$AH = this.O(t4));
  }
  _(t4) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t4 : this.T(l2.createTextNode(t4)), this._$AH = t4;
  }
  $(t4) {
    const { values: i5, _$litType$: s4 } = t4, e5 = "number" == typeof s4 ? this._$AC(t4) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e5) this._$AH.p(i5);
    else {
      const t5 = new R(e5, this), s5 = t5.u(this.options);
      t5.p(i5), this.T(s5), this._$AH = t5;
    }
  }
  _$AC(t4) {
    let i5 = C.get(t4.strings);
    return void 0 === i5 && C.set(t4.strings, i5 = new S2(t4)), i5;
  }
  k(t4) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e5 = 0;
    for (const h3 of t4) e5 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e5], s4._$AI(h3), e5++;
    e5 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e5), i5.length = e5);
  }
  _$AR(t4 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t4 !== this._$AB; ) {
      const s5 = i3(t4).nextSibling;
      i3(t4).remove(), t4 = s5;
    }
  }
  setConnected(t4) {
    void 0 === this._$AM && (this._$Cv = t4, this._$AP?.(t4));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t4, i5, s4, e5, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t4, this.name = i5, this._$AM = e5, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t4, i5 = this, s4, e5) {
    const h3 = this.strings;
    let o6 = false;
    if (void 0 === h3) t4 = M(this, t4, i5, 0), o6 = !a2(t4) || t4 !== this._$AH && t4 !== E, o6 && (this._$AH = t4);
    else {
      const e6 = t4;
      let n5, r6;
      for (t4 = h3[0], n5 = 0; n5 < h3.length - 1; n5++) r6 = M(this, e6[s4 + n5], i5, n5), r6 === E && (r6 = this._$AH[n5]), o6 || (o6 = !a2(r6) || r6 !== this._$AH[n5]), r6 === A ? t4 = A : t4 !== A && (t4 += (r6 ?? "") + h3[n5 + 1]), this._$AH[n5] = r6;
    }
    o6 && !e5 && this.j(t4);
  }
  j(t4) {
    t4 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t4 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t4) {
    this.element[this.name] = t4 === A ? void 0 : t4;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t4) {
    this.element.toggleAttribute(this.name, !!t4 && t4 !== A);
  }
};
var z = class extends H {
  constructor(t4, i5, s4, e5, h3) {
    super(t4, i5, s4, e5, h3), this.type = 5;
  }
  _$AI(t4, i5 = this) {
    if ((t4 = M(this, t4, i5, 0) ?? A) === E) return;
    const s4 = this._$AH, e5 = t4 === A && s4 !== A || t4.capture !== s4.capture || t4.once !== s4.once || t4.passive !== s4.passive, h3 = t4 !== A && (s4 === A || e5);
    e5 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t4), this._$AH = t4;
  }
  handleEvent(t4) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t4) : this._$AH.handleEvent(t4);
  }
};
var Z = class {
  constructor(t4, i5, s4) {
    this.element = t4, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t4) {
    M(this, t4);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ?? (t2.litHtmlVersions = [])).push("3.3.3");
var D = (t4, i5, s4) => {
  const e5 = s4?.renderBefore ?? i5;
  let h3 = e5._$litPart$;
  if (void 0 === h3) {
    const t5 = s4?.renderBefore ?? null;
    e5._$litPart$ = h3 = new k(i5.insertBefore(c3(), t5), t5, void 0, s4 ?? {});
  }
  return h3._$AI(t4), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var _a;
    const t4 = super.createRenderRoot();
    return (_a = this.renderOptions).renderBefore ?? (_a.renderBefore = t4.firstChild), t4;
  }
  update(t4) {
    const r6 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t4), this._$Do = D(r6, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ?? (s3.litElementVersions = [])).push("4.2.2");

// node_modules/@lit/reactive-element/decorators/custom-element.js
var t3 = (t4) => (e5, o6) => {
  void 0 !== o6 ? o6.addInitializer(() => {
    customElements.define(t4, e5);
  }) : customElements.define(t4, e5);
};

// node_modules/@lit/reactive-element/decorators/property.js
var o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r4 = (t4 = o5, e5, r6) => {
  const { kind: n5, metadata: i5 } = r6;
  let s4 = globalThis.litPropertyMetadata.get(i5);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i5, s4 = /* @__PURE__ */ new Map()), "setter" === n5 && ((t4 = Object.create(t4)).wrapped = true), s4.set(r6.name, t4), "accessor" === n5) {
    const { name: o6 } = r6;
    return { set(r7) {
      const n6 = e5.get.call(this);
      e5.set.call(this, r7), this.requestUpdate(o6, n6, t4, true, r7);
    }, init(e6) {
      return void 0 !== e6 && this.C(o6, void 0, t4, e6), e6;
    } };
  }
  if ("setter" === n5) {
    const { name: o6 } = r6;
    return function(r7) {
      const n6 = this[o6];
      e5.call(this, r7), this.requestUpdate(o6, n6, t4, true, r7);
    };
  }
  throw Error("Unsupported decorator location: " + n5);
};
function n4(t4) {
  return (e5, o6) => "object" == typeof o6 ? r4(t4, e5, o6) : ((t5, e6, o7) => {
    const r6 = e6.hasOwnProperty(o7);
    return e6.constructor.createProperty(o7, t5), r6 ? Object.getOwnPropertyDescriptor(e6, o7) : void 0;
  })(t4, e5, o6);
}

// node_modules/@lit/reactive-element/decorators/state.js
function r5(r6) {
  return n4({ ...r6, state: true, attribute: false });
}

// src/actions.ts
var HOLD_MS = 500;
var DOUBLE_TAP_MS = 250;
function hasAction(action) {
  return action !== void 0 && action.action !== "none";
}
function isTappable(config) {
  return config.tap_action === void 0 || hasAction(config.tap_action);
}
var GestureDetector = class {
  constructor(config, fire) {
    this.config = config;
    this.fire = fire;
    this.held = false;
  }
  pointerDown() {
    this.held = false;
    clearTimeout(this.holdTimer);
    if (hasAction(this.config()?.hold_action)) {
      this.holdTimer = setTimeout(() => {
        this.held = true;
        this.fire("hold");
      }, HOLD_MS);
    }
  }
  pointerUp() {
    clearTimeout(this.holdTimer);
  }
  click() {
    if (this.held) {
      this.held = false;
      return;
    }
    if (!hasAction(this.config()?.double_tap_action)) {
      this.fire("tap");
      return;
    }
    if (this.tapTimer !== void 0) {
      clearTimeout(this.tapTimer);
      this.tapTimer = void 0;
      this.fire("double_tap");
      return;
    }
    this.tapTimer = setTimeout(() => {
      this.tapTimer = void 0;
      this.fire("tap");
    }, DOUBLE_TAP_MS);
  }
  key(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.fire("tap");
    }
  }
  dispose() {
    clearTimeout(this.holdTimer);
    clearTimeout(this.tapTimer);
    this.tapTimer = void 0;
  }
};

// src/chart.ts
var WIDTH = 100;
var HEIGHT = 32;
var TOP = 2;
var PLOT_HEIGHT = 30;
var MARKS = [3, 6, 8, 11];
var MARK_GAP = 10;
var BASELINE_GAP = 5;
var CompactUvIndexChart = class extends i4 {
  constructor() {
    super(...arguments);
    this.kind = "bars";
    this.items = [];
    this.start = 0;
    this.end = 0;
    this.floor = 1;
    this.heading = "";
    this.brief = "";
    this.language = "en";
  }
  render() {
    const values = this.items.map((item) => item.value ?? 0);
    const top = Math.max(this.floor, ...values);
    const active = this.active === void 0 ? void 0 : this.items[this.active];
    const x2 = active === void 0 ? 0 : this.xOf(this.active ?? 0);
    const steps = stepsShown(top);
    const number = new Intl.NumberFormat(this.language);
    const y3 = (value) => HEIGHT - heightOf(value, top);
    return b2`
            <div class="frame">
                ${steps.length === 0 ? A : b2`<div class="axis">
                              ${steps.map((step) => b2`<span class="sizer">${number.format(step)}</span>`)}
                              ${steps.map(
      (step) => b2`<span class="value" style="top: ${y3(lineOf(step)) / HEIGHT * 100}%"
                                          >${number.format(step)}</span
                                      >`
    )}
                          </div>`}
                <div
                    class="plot"
                    @pointermove=${this.point}
                    @pointerdown=${(event) => {
      event.stopPropagation();
      this.point(event);
    }}
                    @pointerleave=${() => this.active = void 0}
                    @click=${(event) => event.stopPropagation()}
                >
                    <svg viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="none" aria-hidden="true">
                        ${steps.map((step) => w`<line class="mark" x1="0" x2=${WIDTH} y1=${y3(lineOf(step))} y2=${y3(lineOf(step))}></line>`)}
                        <line class="baseline" x1="0" x2=${WIDTH} y1=${HEIGHT} y2=${HEIGHT}></line>
                        ${this.kind === "bars" ? this.bars(top) : this.line(top)}
                        ${active === void 0 || this.kind === "bars" ? A : w`<line class="cursor" x1=${x2} x2=${x2} y1="0" y2=${HEIGHT}></line>`}
                    </svg>
                    ${active === void 0 ? A : b2`<div class="bubble" style="left: ${x2}%; transform: translateX(-${x2}%)">${active.label}</div>`}
                </div>
            </div>
            <div class="heading"><span class="long">${this.heading}</span><span class="brief">${this.brief || this.heading}</span></div>
        `;
  }
  bars(top) {
    const slot = WIDTH / Math.max(this.items.length, 1);
    return w`${this.items.map((item, index) => {
      const height = item.value ? Math.max(heightOf(item.value, top), 0.8) : 0;
      return w`<rect class=${index === this.active ? "bar active" : "bar"} x=${index * slot + slot * 0.15}
        y=${HEIGHT - height} width=${slot * 0.7} height=${height} style="fill: ${item.colour}"></rect>`;
    })}`;
  }
  /** A line from reading to reading, the index changing smoothly through the day, coloured by its levels. */
  line(top) {
    const points = this.items.filter((item) => item.value !== null);
    if (points.length === 0) {
      return w``;
    }
    const y3 = (value) => HEIGHT - heightOf(value, top);
    const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${this.xAt(point.time)} ${y3(point.value ?? 0)}`).join(" ");
    const stops = points.map((point) => w`<stop offset=${this.xAt(point.time) / WIDTH} style="stop-color: ${point.colour}"></stop>`);
    return w`<defs><linearGradient id="levels" gradientUnits="userSpaceOnUse" x1="0" x2=${WIDTH} y1="0" y2="0"
        >${stops}</linearGradient></defs><path class="stroke" d=${points.length === 1 ? `${path} H${WIDTH}` : path}></path>`;
  }
  xAt(time) {
    const span = this.end - this.start;
    return span > 0 ? Math.min(Math.max((time - this.start) / span * WIDTH, 0), WIDTH) : 0;
  }
  xOf(index) {
    if (this.kind === "bars") {
      const slot = WIDTH / Math.max(this.items.length, 1);
      return index * slot + slot / 2;
    }
    return this.xAt(this.items[index].time);
  }
  /** The item under the pointer: the bar in its slot, or the latest reading at that moment of the line. */
  point(event) {
    const box = event.currentTarget.getBoundingClientRect();
    if (box.width <= 0 || this.items.length === 0) {
      return;
    }
    const share = Math.min(Math.max((event.clientX - box.left) / box.width, 0), 0.9999);
    this.active = indexAt(this.kind, this.items, share, this.start, this.end);
  }
  static get styles() {
    return i`
            :host {
                display: block;
                container: chart / inline-size;
            }
            .heading {
                font-size: 11px;
                line-height: 14px;
                color: var(--secondary-text-color);
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
            .brief {
                display: none;
            }
            .frame {
                display: flex;
                align-items: flex-start;
                margin-bottom: 2px;
            }
            .plot {
                position: relative;
                flex: 1;
                min-width: 0;
                height: 30px;
                touch-action: pan-y;
            }
            .axis {
                position: relative;
                height: 30px;
                margin-right: 4px;
                font-size: 9px;
                line-height: 9px;
                color: var(--secondary-text-color);
                font-variant-numeric: tabular-nums;
            }
            /* The values, unseen and on no line, give the axis the width of the widest. */
            .sizer {
                display: block;
                height: 0;
                overflow: hidden;
                visibility: hidden;
            }
            .value {
                position: absolute;
                right: 0;
                transform: translateY(-50%);
                white-space: nowrap;
            }
            .mark {
                stroke: var(--divider-color, rgba(127, 127, 127, 0.3));
                stroke-width: 1px;
                stroke-dasharray: 2 3;
                vector-effect: non-scaling-stroke;
            }
            svg {
                display: block;
                width: 100%;
                height: 100%;
                overflow: visible;
            }
            .bar {
                opacity: 0.8;
            }
            .bar.active {
                opacity: 1;
            }
            .stroke {
                fill: none;
                stroke: url(#levels);
                stroke-width: 2px;
                stroke-linejoin: round;
                vector-effect: non-scaling-stroke;
            }
            .baseline {
                stroke: var(--divider-color, rgba(127, 127, 127, 0.3));
                stroke-width: 1px;
                vector-effect: non-scaling-stroke;
            }
            .cursor {
                stroke: var(--secondary-text-color);
                stroke-width: 1px;
                vector-effect: non-scaling-stroke;
            }
            .bubble {
                position: absolute;
                bottom: calc(100% + 4px);
                padding: 2px 6px;
                border-radius: 6px;
                background: var(--primary-text-color);
                color: var(--card-background-color, var(--ha-card-background, #fff));
                font-size: 11px;
                line-height: 16px;
                white-space: nowrap;
                pointer-events: none;
                z-index: 1;
            }

            /* The narrow overrides come last, so that they win over the rules above. */

            /* In the narrowest cards, three or four columns of a section: the short heading, a little smaller. */
            @container chart (max-width: 130px) {
                .heading {
                    font-size: 10px;
                }
                .long {
                    display: none;
                }
                .brief {
                    display: inline;
                }
            }

            /* The narrowest of all: the heading may take two lines rather than lose its period. */
            @container chart (max-width: 100px) {
                .heading {
                    white-space: normal;
                }
            }
        `;
  }
};
__decorateClass([
  n4()
], CompactUvIndexChart.prototype, "kind", 2);
__decorateClass([
  n4({ attribute: false })
], CompactUvIndexChart.prototype, "items", 2);
__decorateClass([
  n4({ type: Number })
], CompactUvIndexChart.prototype, "start", 2);
__decorateClass([
  n4({ type: Number })
], CompactUvIndexChart.prototype, "end", 2);
__decorateClass([
  n4({ type: Number })
], CompactUvIndexChart.prototype, "floor", 2);
__decorateClass([
  n4()
], CompactUvIndexChart.prototype, "heading", 2);
__decorateClass([
  n4()
], CompactUvIndexChart.prototype, "brief", 2);
__decorateClass([
  n4()
], CompactUvIndexChart.prototype, "language", 2);
__decorateClass([
  r5()
], CompactUvIndexChart.prototype, "active", 2);
CompactUvIndexChart = __decorateClass([
  t3("compact-uv-index-chart")
], CompactUvIndexChart);
function heightOf(value, top) {
  return value / top * (HEIGHT - TOP);
}
function lineOf(step) {
  return step - 0.5;
}
function stepsShown(top) {
  const lines = marksUnder(top, MARKS.map(lineOf));
  return MARKS.filter((step) => lines.includes(lineOf(step)));
}
function marksUnder(top, candidates) {
  const pixels = (value) => heightOf(value, top) * (PLOT_HEIGHT / HEIGHT);
  const marks = [];
  for (const value of candidates) {
    const clear = marks.every((mark) => Math.abs(pixels(value) - pixels(mark)) >= MARK_GAP);
    if (value <= top && pixels(value) >= BASELINE_GAP && clear) {
      marks.push(value);
    }
  }
  return marks.sort((a3, b3) => a3 - b3);
}
function indexAt(kind, items, share, start, end) {
  if (kind === "bars") {
    return Math.min(Math.floor(share * items.length), items.length - 1);
  }
  const time = start + share * (end - start);
  let found = 0;
  items.forEach((item, index) => {
    if (item.time <= time) {
      found = index;
    }
  });
  return found;
}

// src/const.ts
var CARD_VERSION = "1.1.0";

// src/history.ts
var HOUR = 36e5;
var DAY = 24 * HOUR;
var WEEK_DAYS = 7;
var LOOKBACK_DAYS = 30;
var MAX_HOURLY_CHART_HOURS = 168;
function dayFormatter(timeZone) {
  const format = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return (time) => {
    const parts = format.formatToParts(new Date(time));
    const part = (type) => parts.find((entry) => entry.type === type)?.value ?? "";
    return `${part("year")}-${part("month")}-${part("day")}`;
  };
}
function lastDays(count, now, timeZone) {
  const dayOf = dayFormatter(timeZone);
  const days = [];
  for (let time = now; days.length < count; time -= 6 * HOUR) {
    const day = dayOf(time);
    if (days[0]?.day !== day) {
      days.unshift({ day, time });
    }
  }
  return days;
}
function daysFromHourly(rows, days, timeZone) {
  const dayOf = dayFormatter(timeZone);
  const peaks = /* @__PURE__ */ new Map();
  for (const row of rows) {
    if (typeof row.max === "number") {
      const day = dayOf(row.start);
      peaks.set(day, Math.max(peaks.get(day) ?? row.max, row.max));
    }
  }
  return days.map(({ day, time }) => ({ day, time, peak: peaks.get(day) ?? null }));
}
function peakOf(days, count) {
  const recent = days.slice(-count).filter((day) => day.peak !== null);
  if (days.length < count || recent.length === 0) {
    return null;
  }
  return Math.max(...recent.map((day) => day.peak ?? 0));
}
function todayPeak(points, live, now, timeZone) {
  const dayOf = dayFormatter(timeZone);
  const today = dayOf(now);
  const values = points.filter((point) => dayOf(point.time) === today).map((point) => point.value);
  if (live !== null) {
    values.push(live);
  }
  return values.length === 0 ? null : Math.max(...values);
}
function pointsOf(answer, id) {
  const points = [];
  for (const row of answer?.[id] ?? []) {
    const value = Number.parseFloat(String(row.s));
    const seconds = Number(row.lu ?? row.lc);
    if (Number.isFinite(value) && Number.isFinite(seconds)) {
      points.push({ time: seconds * 1e3, value });
    }
  }
  return points.sort((one, other) => one.time - other.time);
}
async function fetchDays(hass, id, count, now) {
  const days = lastDays(count, now, hass.config?.time_zone);
  if (!hass.callWS) {
    return days.map(({ day, time }) => ({ day, time, peak: null }));
  }
  const answer = await hass.callWS({
    type: "recorder/statistics_during_period",
    start_time: new Date(days[0].time - DAY).toISOString(),
    end_time: new Date(now).toISOString(),
    statistic_ids: [id],
    period: "hour",
    types: ["max"]
  });
  return daysFromHourly(answer?.[id] ?? [], days, hass.config?.time_zone);
}
async function fetchPoints(hass, id, hours, now) {
  if (!hass.callWS) {
    return [];
  }
  const answer = await hass.callWS({
    type: "history/history_during_period",
    start_time: new Date(now - hours * HOUR).toISOString(),
    end_time: new Date(now).toISOString(),
    entity_ids: [id],
    minimal_response: true,
    no_attributes: true,
    significant_changes_only: false
  });
  return pointsOf(answer, id);
}

// src/localize/languages/en.json
var en_default = {
  common: {
    name: "Compact UV index",
    description: "The UV index as a sun with a ray for each step, with its level and the day's peak",
    invalid_configuration: "Choose a UV index sensor for the card",
    invalid_hourly_chart_hours: "Hours in the index chart must be a number",
    invalid_daily_chart_days: "Days in the bars must be a number",
    no_entity: "Sensor not found:",
    index: "UV index",
    index_short: "UV",
    peak: "Today's peak",
    peak_short: "Peak",
    yesterday: "Yesterday",
    week: "Past 7 days",
    month: "Past 30 days",
    daily_chart: "Daily peak, last {days} days",
    hourly_chart: "UV index, last {hours} h",
    yesterday_short: "1 d",
    week_short: "7 d",
    month_short: "30 d",
    daily_chart_short: "Peak, {days} d",
    hourly_chart_short: "UV, {hours} h"
  },
  level: {
    low: "Low",
    moderate: "Moderate",
    high: "High",
    very_high: "Very high",
    extreme: "Extreme"
  },
  advice: {
    protect: "Protect yourself around midday. Shade, clothing, a hat and sunscreen.",
    avoid: "Avoid the midday sun. Seek shade, and wear clothing, a hat and sunscreen."
  },
  editor: {
    entity: "UV index sensor",
    entity_helper: "The UV index now.",
    border_colour: "Outline colour",
    language: "Language",
    language_helper: "Home Assistant's language when left empty.",
    interactions: "Interactions",
    tap_action: "Tap",
    hold_action: "Hold",
    double_tap_action: "Double tap",
    display: "Display",
    animate_sun: "Sun animation",
    animate_sun_helper: "The lit rays glow while the sun is up.",
    show_level: "Level",
    show_level_helper: "Bars beside the index and the level's name under it, from low to extreme.",
    show_advice: "Protection advice",
    show_advice_helper: "How to protect yourself, from index 3 up.",
    show_yesterday: "Yesterday's peak",
    show_week: "Peak of the last 7 days",
    show_month: "Peak of the last 30 days",
    charts: "Charts",
    show_daily_chart: "Daily peak bars",
    daily_chart_days: "Days in the bars",
    show_hourly_chart: "Index chart",
    hourly_chart_hours: "Hours in the index chart",
    hourly_chart_hours_helper: "Up to 168, a week. The recorder keeps the history for ten days by default."
  }
};

// src/localize/languages/fi.json
var fi_default = {
  common: {
    name: "Kompakti UV-indeksi",
    description: "UV-indeksi aurinkona, jossa on s\xE4de jokaista indeksin askelta kohden, sek\xE4 sen taso ja p\xE4iv\xE4n huippu",
    invalid_configuration: "Valitse kortille UV-indeksin sensori",
    invalid_hourly_chart_hours: "Indeksikaavion tuntim\xE4\xE4r\xE4n on oltava luku",
    invalid_daily_chart_days: "Pylv\xE4iden p\xE4ivien m\xE4\xE4r\xE4n on oltava luku",
    no_entity: "Sensoria ei l\xF6ydy:",
    index: "UV-indeksi",
    index_short: "UV",
    peak: "Huippu t\xE4n\xE4\xE4n",
    peak_short: "Huippu",
    yesterday: "Eilen",
    week: "7 p\xE4iv\xE4\xE4",
    month: "30 p\xE4iv\xE4\xE4",
    daily_chart: "P\xE4iv\xE4n huippu, {days} pv",
    hourly_chart: "UV-indeksi, {hours} h",
    yesterday_short: "1 pv",
    week_short: "7 pv",
    month_short: "30 pv",
    daily_chart_short: "Huippu, {days} pv",
    hourly_chart_short: "UV, {hours} h"
  },
  level: {
    low: "Heikko",
    moderate: "Kohtalainen",
    high: "Voimakas",
    very_high: "Eritt\xE4in voimakas",
    extreme: "\xC4\xE4rimm\xE4isen voimakas"
  },
  advice: {
    protect: "Suojaudu keskip\xE4iv\xE4ll\xE4. Varjo, vaatteet, hattu ja aurinkovoide.",
    avoid: "V\xE4lt\xE4 keskip\xE4iv\xE4n aurinkoa. Hakeudu varjoon ja k\xE4yt\xE4 vaatteita, hattua ja aurinkovoidetta."
  },
  editor: {
    entity: "UV-indeksin sensori",
    entity_helper: "UV-indeksi juuri nyt.",
    border_colour: "Reunan v\xE4ri",
    language: "Kieli",
    language_helper: "Tyhj\xE4n\xE4 Home Assistantin kieli.",
    interactions: "Toiminnot",
    tap_action: "Napautus",
    hold_action: "Pitk\xE4 painallus",
    double_tap_action: "Kaksoisnapautus",
    display: "N\xE4kym\xE4",
    animate_sun: "Aurinkoanimaatio",
    animate_sun_helper: "Palavat s\xE4teet hehkuvat, kun aurinko on ylh\xE4\xE4ll\xE4.",
    show_level: "Taso",
    show_level_helper: "Palkit indeksin vieress\xE4 ja tason nimi sen alla, heikosta \xE4\xE4rimm\xE4isen voimakkaaseen.",
    show_advice: "Suojautumisohje",
    show_advice_helper: "Miten suojautua, kun indeksi on 3 tai yli.",
    show_yesterday: "Eilinen huippu",
    show_week: "Viimeisten 7 p\xE4iv\xE4n huippu",
    show_month: "Viimeisten 30 p\xE4iv\xE4n huippu",
    charts: "Kaaviot",
    show_daily_chart: "P\xE4iv\xE4n huiput pylv\xE4in\xE4",
    daily_chart_days: "P\xE4ivi\xE4 pylv\xE4iss\xE4",
    show_hourly_chart: "Indeksikaavio",
    hourly_chart_hours: "Tunteja indeksikaaviossa",
    hourly_chart_hours_helper: "Enint\xE4\xE4n 168 eli viikko. Tallennin s\xE4ilytt\xE4\xE4 historiaa oletuksena kymmenen p\xE4iv\xE4\xE4."
  }
};

// src/localize/localize.ts
var FILES = { "./languages/en.json": en_default, "./languages/fi.json": fi_default };
var LANGUAGES = Object.fromEntries(
  Object.entries(FILES).map(([path, table]) => [path.replace(/^.*\/|\.json$/g, "").toLowerCase(), table])
);
var LANGUAGE_CODES = Object.keys(LANGUAGES).sort();
function translate(language, key) {
  const code = (language ?? "en").split(/[-_]/)[0].toLowerCase();
  return read(LANGUAGES[code], key) ?? read(LANGUAGES.en, key) ?? key;
}
function read(table, key) {
  let value = table;
  for (const part of key.split(".")) {
    if (value === null || typeof value !== "object") {
      return void 0;
    }
    value = value[part];
  }
  return typeof value === "string" ? value : void 0;
}
function browserLanguage() {
  return document.documentElement.lang || navigator.language || "en";
}

// src/types.ts
var DEFAULTS = {
  animate_sun: true,
  show_level: true,
  show_advice: true,
  show_yesterday: false,
  show_week: false,
  show_month: false,
  show_daily_chart: false,
  daily_chart_days: 14,
  show_hourly_chart: false,
  hourly_chart_hours: 24
};
function checkNumbers(config) {
  for (const key of ["daily_chart_days", "hourly_chart_hours"]) {
    const value = config[key];
    if (value != null && !(typeof value === "number" && Number.isFinite(value))) {
      throw new Error(translate(browserLanguage(), `common.invalid_${key}`));
    }
  }
}
function option(config, key) {
  const value = config[key];
  return value ?? DEFAULTS[key];
}

// src/editor.ts
var OPTIONAL = ["border_colour", "language", "daily_chart_days", "hourly_chart_hours"];
function languageName(code, viewer) {
  try {
    const name = new Intl.DisplayNames([viewer], { type: "language" }).of(code);
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : code;
  } catch {
    return code;
  }
}
function schema(viewer) {
  const toggle = (name) => ({ name, selector: { boolean: {} } });
  return [
    { name: "entity", required: true, selector: { entity: { domain: "sensor" } } },
    {
      name: "language",
      selector: {
        select: {
          mode: "dropdown",
          options: LANGUAGE_CODES.map((code) => ({ value: code, label: languageName(code, viewer) }))
        }
      }
    },
    {
      type: "expandable",
      name: "display",
      flatten: true,
      schema: [
        {
          type: "grid",
          name: "",
          schema: [
            toggle("animate_sun"),
            toggle("show_level"),
            toggle("show_advice"),
            toggle("show_yesterday"),
            toggle("show_week"),
            toggle("show_month")
          ]
        },
        { name: "border_colour", selector: { text: {} } }
      ]
    },
    {
      type: "expandable",
      name: "charts",
      flatten: true,
      schema: [
        {
          type: "grid",
          name: "",
          schema: [
            toggle("show_daily_chart"),
            { name: "daily_chart_days", selector: { number: { min: 2, max: 60, step: 1, mode: "box" } } },
            toggle("show_hourly_chart"),
            {
              name: "hourly_chart_hours",
              selector: { number: { min: 1, max: MAX_HOURLY_CHART_HOURS, step: 1, mode: "box" } }
            }
          ]
        }
      ]
    },
    {
      type: "expandable",
      name: "interactions",
      flatten: true,
      schema: [
        { name: "tap_action", selector: { ui_action: { default_action: "more-info" } } },
        { name: "hold_action", selector: { ui_action: { default_action: "none" } } },
        { name: "double_tap_action", selector: { ui_action: { default_action: "none" } } }
      ]
    }
  ];
}
function formData(config) {
  return { ...DEFAULTS, ...config };
}
function configOf(data) {
  const config = { ...data };
  for (const key of OPTIONAL) {
    const value = config[key];
    if (value === void 0 || value === null || String(value).trim() === "") {
      delete config[key];
    }
  }
  for (const [key, value] of Object.entries(DEFAULTS)) {
    if (config[key] === value) {
      delete config[key];
    }
  }
  return config;
}
var CompactUvIndexCardEditor = class extends i4 {
  constructor() {
    super(...arguments);
    this.config = {
      type: "custom:compact-uv-index-card",
      entity: ""
    };
  }
  /** A number option the form can't show sends Home Assistant to the YAML editor instead. */
  setConfig(config) {
    checkNumbers(config);
    this.config = { ...config };
  }
  render() {
    if (!this.hass) {
      return A;
    }
    const data = formData(this.config);
    return b2`
            <ha-form
                .hass=${this.hass}
                .data=${data}
                .schema=${schema(this.language())}
                .computeLabel=${(entry) => this.text(`editor.${entry.name}`)}
                .computeHelper=${(entry) => this.helper(entry.name)}
                @value-changed=${this.valueChanged}
            ></ha-form>
        `;
  }
  valueChanged(event) {
    this.config = configOf(event.detail.value);
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this.config }, bubbles: true, composed: true }));
  }
  text(key) {
    return translate(this.language(), key);
  }
  helper(name) {
    const key = `editor.${name}_helper`;
    const helper = translate(this.language(), key);
    return helper === key ? void 0 : helper;
  }
  /** The editor speaks the viewer's language, not the one chosen for the card. */
  language() {
    return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
  }
};
__decorateClass([
  n4({ attribute: false })
], CompactUvIndexCardEditor.prototype, "hass", 2);
__decorateClass([
  r5()
], CompactUvIndexCardEditor.prototype, "config", 2);
CompactUvIndexCardEditor = __decorateClass([
  t3("compact-uv-index-card-editor")
], CompactUvIndexCardEditor);

// src/gauge.ts
var NO_VALUE = "\u2014";
function valueOf(entity) {
  if (!entity) {
    return null;
  }
  const value = Number.parseFloat(entity.state);
  return Number.isFinite(value) ? value : null;
}
function precisionOf(hass, entityId) {
  const precision = hass.entities?.[entityId]?.display_precision;
  return typeof precision === "number" && precision >= 0 ? precision : void 0;
}
function shownValue(value, precision) {
  if (value === null) {
    return null;
  }
  const scale = 10 ** (precision ?? 1);
  return Math.round(value * scale) / scale;
}
function indexText(value, language, precision) {
  if (value === null) {
    return NO_VALUE;
  }
  const digits = precision === void 0 ? { maximumFractionDigits: 1 } : { minimumFractionDigits: precision, maximumFractionDigits: precision };
  return new Intl.NumberFormat(language, digits).format(value);
}
function findUvSensor(hass) {
  return Object.values(hass?.states ?? {}).find((entity) => {
    if (!entity || !entity.entity_id.startsWith("sensor.")) {
      return false;
    }
    const unit = entity.attributes.unit_of_measurement;
    return /(^|_)uvi?(_|$)|uv_?index/i.test(entity.entity_id.slice(7)) || typeof unit === "string" && /\buv\b/i.test(unit);
  })?.entity_id;
}

// src/levels.ts
var LEVELS = ["low", "moderate", "high", "very_high", "extreme"];
var COLOURS = {
  low: "#4eb400",
  moderate: "#f7e400",
  high: "#f85900",
  very_high: "#d8001d",
  extreme: "#6b49c8"
};
function roundedIndex(value) {
  return Math.max(Math.round(value), 0);
}
function levelOf(value) {
  if (value === null) {
    return null;
  }
  const index = roundedIndex(value);
  return index >= 11 ? "extreme" : index >= 8 ? "very_high" : index >= 6 ? "high" : index >= 3 ? "moderate" : "low";
}
function colourOf(level) {
  return `var(--uv-index-${level.replace("_", "-")}-color, ${COLOURS[level]})`;
}
function adviceOf(level) {
  if (level === "very_high" || level === "extreme") {
    return "avoid";
  }
  return level === "moderate" || level === "high" ? "protect" : null;
}

// src/sun.ts
var SUN_SIZE = 100;
var RAYS = 12;
var CENTRE = 50;
var DISC = 22;
var RAY_START = 31;
var RAY_END = 43;
var LONG_RAY_END = 47;
function litRays(value) {
  return value === null ? 0 : Math.min(roundedIndex(value), RAYS);
}
function sun({ value, glowing }) {
  const lit = litRays(value);
  const level = levelOf(value);
  const up = value !== null && value > 0 && level !== null;
  return w`
    ${Array.from({ length: RAYS }, (_2, ray) => {
    const step = ray + 1;
    const angle = step / RAYS * 2 * Math.PI - Math.PI / 2;
    const end = step % 3 === 0 ? LONG_RAY_END : RAY_END;
    const on = step <= lit;
    const stepLevel = levelOf(step);
    return w`<line class=${on ? glowing ? "ray on glow" : "ray on" : "ray"}
          x1=${CENTRE + Math.cos(angle) * RAY_START} y1=${CENTRE + Math.sin(angle) * RAY_START}
          x2=${CENTRE + Math.cos(angle) * end} y2=${CENTRE + Math.sin(angle) * end}
          style=${on && stepLevel ? `stroke: ${colourOf(stepLevel)}; animation-delay: ${(ray * 0.25).toFixed(2)}s` : ""}></line>`;
  })}
    <circle class="disc" cx=${CENTRE} cy=${CENTRE} r=${DISC} style=${up ? `fill: ${colourOf(level)}` : ""}></circle>
  `;
}

// src/compact-uv-index-card.ts
console.info(
  `%c  COMPACT-UV-INDEX-CARD 
%c  ${CARD_VERSION}    `,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);
var registry = window;
registry.customCards = registry.customCards ?? [];
registry.customCards.push({
  type: "compact-uv-index-card",
  name: translate(browserLanguage(), "common.name"),
  description: translate(browserLanguage(), "common.description"),
  documentationURL: "https://github.com/jesmak/compact-uv-index-card",
  preview: true
});
var REFRESH_INTERVAL = 15 * 6e4;
var TODAY_HOURS = 24;
var CHART_FLOOR = 3;
var OPTIONAL_PARTS = ["hourly-chart", "daily-chart", "extras", "advice"];
function labelledFits(gauge) {
  const figures = gauge.querySelector(".figures");
  const figuresFit = !figures || figures.scrollHeight <= figures.clientHeight + 1;
  return figuresFit && gauge.scrollHeight <= gauge.clientHeight + 1;
}
function fitCard(content) {
  const gauge = content.querySelector(".gauge");
  content.classList.remove(...OPTIONAL_PARTS.map((part) => `hide-${part}`));
  gauge?.classList.remove("short");
  for (const part of OPTIONAL_PARTS) {
    const fits = content.scrollHeight <= content.clientHeight + 1;
    if (fits && (!gauge || labelledFits(gauge))) {
      break;
    }
    content.classList.add(`hide-${part}`);
  }
  if (!gauge) {
    return;
  }
  gauge.classList.toggle("short", !labelledFits(gauge));
  const style = getComputedStyle(gauge);
  const height = gauge.clientHeight - (parseFloat(style.paddingTop) || 0) - (parseFloat(style.paddingBottom) || 0);
  gauge.style.setProperty("--sun-width", `${Math.max(Math.round(height), 0)}px`);
}
var CompactUvIndexCard = class extends i4 {
  constructor() {
    super(...arguments);
    this.gestures = new GestureDetector(
      () => this.config,
      (gesture) => this.act(gesture)
    );
    /** Fits the card again whenever its height, or the gauge's, changes. */
    this.resizer = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver(() => {
      const content = this.renderRoot.querySelector(".content");
      if (content) {
        fitCard(content);
      }
    });
    this.observed = [];
    /** When the recorder was last asked, or 0 when it is to be asked again at the next update. */
    this.fetchedAt = 0;
    this.fetching = false;
  }
  static getConfigElement() {
    return document.createElement("compact-uv-index-card-editor");
  }
  /** Offers a UV sensor that is there when the card is added from the picker. */
  static getStubConfig(hass) {
    const entity = findUvSensor(hass);
    return entity ? { entity } : {};
  }
  setConfig(config) {
    if (!config || typeof config.entity !== "string" || config.entity === "") {
      throw new Error(translate(browserLanguage(), "common.invalid_configuration"));
    }
    checkNumbers(config);
    this.config = { ...config };
    this.days = void 0;
    this.points = void 0;
    this.fetchedAt = 0;
  }
  getCardSize() {
    return 3 + this.parts();
  }
  /** Three rows of a sections view and half its width, and a row more for the peaks and for each chart. */
  getGridOptions() {
    return { columns: 6, rows: 3 + this.parts(), min_columns: 3, min_rows: 1 };
  }
  /**
   * A card taken off the page and put back, as a masonry view does when it moves cards between columns, isn't
   * rendered again by itself: the update watches its size again, and asks the recorder if the days are old.
   */
  connectedCallback() {
    super.connectedCallback();
    this.timer = setInterval(() => void this.refresh(), REFRESH_INTERVAL);
    this.requestUpdate();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.timer);
    this.gestures.dispose();
    this.resizer?.disconnect();
    this.observed = [];
  }
  shouldUpdate(changed) {
    if (!this.config || changed.size > 1 || !changed.has("hass")) {
      return true;
    }
    const previous = changed.get("hass");
    if (!previous || previous.locale !== this.hass?.locale || previous.language !== this.hass?.language) {
      return true;
    }
    return previous.states[this.config.entity] !== this.hass?.states[this.config.entity];
  }
  updated() {
    const watched = [this.renderRoot.querySelector(".gauge"), this.renderRoot.querySelector(".content")].filter(
      (element) => element !== null
    );
    if (watched.length !== this.observed.length || watched.some((element, index) => element !== this.observed[index])) {
      this.resizer?.disconnect();
      watched.forEach((element) => this.resizer?.observe(element));
      this.observed = watched;
    }
    const content = this.renderRoot.querySelector(".content");
    if (content) {
      fitCard(content);
    }
    if (this.isStale()) {
      void this.refresh();
    }
  }
  /** Whether the recorder is to be asked again: never asked, asked too long ago, or the day has changed since. */
  isStale() {
    if (this.fetchedAt === 0 || Date.now() - this.fetchedAt >= REFRESH_INTERVAL) {
      return true;
    }
    const last = this.days?.[this.days.length - 1];
    return last !== void 0 && last.day !== this.today();
  }
  today() {
    return dayFormatter(this.hass?.config?.time_zone)(Date.now());
  }
  /** Asks the recorder for the readings of today, and for the days the options need. */
  async refresh() {
    const hass = this.hass;
    const config = this.config;
    if (!hass?.callWS || !config || !hass.states[config.entity] || this.fetching) {
      return;
    }
    this.fetching = true;
    this.fetchedAt = Date.now();
    const now = Date.now();
    const count = this.daysNeeded();
    const hours = Math.max(TODAY_HOURS, option(config, "show_hourly_chart") ? this.chartHours() : 0);
    const quietly = (promise) => promise.catch(() => void 0);
    try {
      const [days, points] = await Promise.all([
        count > 0 ? quietly(fetchDays(hass, config.entity, count, now)) : void 0,
        quietly(fetchPoints(hass, config.entity, hours, now))
      ]);
      if (config === this.config) {
        this.days = days;
        this.points = points;
      }
    } finally {
      this.fetching = false;
    }
    if (config !== this.config) {
      void this.refresh();
    }
  }
  /** How many days the options need. */
  daysNeeded() {
    const config = this.config;
    if (!config) {
      return 0;
    }
    const needs = [
      option(config, "show_daily_chart") ? this.chartDays() : 0,
      option(config, "show_month") ? LOOKBACK_DAYS : 0,
      option(config, "show_week") ? WEEK_DAYS : 0,
      option(config, "show_yesterday") ? 2 : 0
    ];
    return Math.max(...needs);
  }
  chartDays() {
    return this.config ? Math.min(Math.max(option(this.config, "daily_chart_days"), 2), 60) : 0;
  }
  chartHours() {
    return this.config ? Math.min(Math.max(option(this.config, "hourly_chart_hours"), 1), MAX_HOURLY_CHART_HOURS) : 0;
  }
  /** How many parts go under the sun: the peaks, and each chart. The advice comes and goes with the sun. */
  parts() {
    const config = this.config;
    if (!config) {
      return 0;
    }
    const peaks = option(config, "show_yesterday") || option(config, "show_week") || option(config, "show_month");
    return [peaks, option(config, "show_daily_chart"), option(config, "show_hourly_chart")].filter(Boolean).length;
  }
  /** Today's peak, once the readings since midnight are in. */
  peakToday(entity) {
    if (!this.points) {
      return this.hass?.callWS ? void 0 : valueOf(entity);
    }
    return todayPeak(this.points, valueOf(entity), Date.now(), this.hass?.config?.time_zone);
  }
  /**
   * The days from the recorder, today's peak in place of the statistics that reach only to the last full hour. A
   * sensor without statistics has no days at all, and today's peak alone would pass for the peak of a week.
   */
  liveDays(peak) {
    if (!this.days || this.days.every((day) => day.peak === null) || peak === void 0) {
      return this.days;
    }
    const last = this.days[this.days.length - 1];
    if (last.day !== this.today()) {
      return this.days;
    }
    const known = [peak, last.peak].filter((value) => value !== null);
    return [...this.days.slice(0, -1), { ...last, peak: known.length === 0 ? null : Math.max(...known) }];
  }
  render() {
    if (!this.hass || !this.config) {
      return A;
    }
    const config = this.config;
    const entity = this.hass.states[config.entity];
    if (!entity) {
      return b2`<ha-card><div class="missing">${this.text("common.no_entity")} ${config.entity}</div></ha-card>`;
    }
    const language = this.language();
    const precision = precisionOf(this.hass, config.entity);
    const value = valueOf(entity);
    const level = levelOf(shownValue(value, precision));
    const now = indexText(value, language, precision);
    const peak = this.peakToday(entity);
    const peakText = peak === void 0 ? NO_VALUE : indexText(peak, language, precision);
    const days = this.liveDays(peak);
    const showLevel = level !== null && option(config, "show_level");
    const levelText = level ? this.text(`level.${level}`) : "";
    const advice = option(config, "show_advice") ? adviceOf(level) : null;
    const adviceText = advice ? this.text(`advice.${advice}`) : "";
    const tappable = isTappable(config);
    return b2`
            <ha-card
                class=${tappable ? "tappable" : ""}
                style=${this.colours()}
                role=${tappable ? "button" : A}
                tabindex=${tappable ? "0" : A}
                aria-label=${[
      `${this.text("common.index")} ${now}`,
      showLevel ? levelText : "",
      `${this.text("common.peak")} ${peakText}`,
      adviceText
    ].filter(Boolean).join(", ")}
                @pointerdown=${() => this.gestures.pointerDown()}
                @pointerup=${() => this.gestures.pointerUp()}
                @pointercancel=${() => this.gestures.pointerUp()}
                @pointerleave=${() => this.gestures.pointerUp()}
                @click=${() => this.gestures.click()}
                @keydown=${(event) => this.gestures.key(event)}
            >
                <div class="content">
                    <div class="gauge">
                        <div class="sun">
                            <svg viewBox="0 0 ${SUN_SIZE} ${SUN_SIZE}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                                ${sun({ value: shownValue(value, precision), glowing: value !== null && value > 0 && option(config, "animate_sun") })}
                            </svg>
                        </div>
                        <div class="figures">
                            <div class="figure now">
                                <span class="label"
                                    ><span class="long">${this.text("common.index")}</span
                                    ><span class="brief">${this.text("common.index_short")}</span></span
                                >
                                <span class="value">${now}${showLevel && level ? this.levelBars(level, levelText) : A}</span>
                                ${showLevel && level ? b2`<span class="level" style="--level-color: ${colourOf(level)}">${levelText}</span>` : A}
                            </div>
                            <div class="figure peak">
                                <span class="label">${this.text("common.peak")}</span>
                                <span class="value"><span class="inline-label">${this.text("common.peak_short")} </span>${peakText}</span>
                            </div>
                        </div>
                    </div>
                    ${advice && level ? b2`<div class="advice"><span class="dot" style="background: ${colourOf(level)}"></span>${adviceText}</div>` : A}
                    ${this.extras(days, language, precision)} ${this.dailyChart(days, language, precision)}
                    ${this.hourlyChart(entity, language, precision)}
                </div>
            </ha-card>
        `;
  }
  /** Five bars of rising height, one for each level, as many lit as the level reaches, each in its colour. */
  levelBars(level, text) {
    const reached = LEVELS.indexOf(level);
    return b2`<span class="levels" title=${text} role="img" aria-label=${text}
            >${LEVELS.map((each, index) => b2`<i style=${index <= reached ? `background: ${colourOf(each)}` : ""}></i>`)}</span
        >`;
  }
  /** The highest index of yesterday, and of the last 7 and 30 days, as the options ask. */
  extras(days, language, precision) {
    const config = this.config;
    if (!config || !days) {
      return A;
    }
    const wanted = [];
    if (option(config, "show_yesterday")) {
      wanted.push(["yesterday", days.length >= 2 ? days[days.length - 2].peak : null]);
    }
    if (option(config, "show_week")) {
      wanted.push(["week", peakOf(days, WEEK_DAYS)]);
    }
    if (option(config, "show_month")) {
      wanted.push(["month", peakOf(days, LOOKBACK_DAYS)]);
    }
    if (wanted.length === 0) {
      return A;
    }
    return b2`<div class="extras">
            ${wanted.map(
      ([name, peak]) => b2`<span class="extra"
                        ><span class="label"
                            ><span class="long">${this.text(`common.${name}`)}</span
                            ><span class="brief">${this.text(`common.${name}_short`)}</span></span
                        >
                        <span class="amount">${indexText(peak, language, precision)}</span></span
                    >`
    )}
        </div>`;
  }
  dailyChart(days, language, precision) {
    const config = this.config;
    if (!config || !option(config, "show_daily_chart") || !days) {
      return A;
    }
    const count = this.chartDays();
    const date = new Intl.DateTimeFormat(language, {
      weekday: "short",
      day: "numeric",
      month: "numeric",
      timeZone: this.hass?.config?.time_zone
    });
    const items = days.slice(-count).map((day) => ({
      time: day.time,
      value: day.peak,
      colour: colourOf(levelOf(shownValue(day.peak, precision)) ?? "low"),
      label: `${date.format(day.time)}: ${indexText(day.peak, language, precision)}`
    }));
    return b2`<compact-uv-index-chart
            class="chart daily-chart"
            kind="bars"
            .items=${items}
            .floor=${CHART_FLOOR}
            .language=${language}
            .heading=${this.text("common.daily_chart", { days: String(count) })}
            .brief=${this.text("common.daily_chart_short", { days: String(count) })}
        ></compact-uv-index-chart>`;
  }
  hourlyChart(entity, language, precision) {
    const config = this.config;
    if (!config || !option(config, "show_hourly_chart") || !this.points) {
      return A;
    }
    const hours = this.chartHours();
    const end = Date.now();
    const start = end - hours * HOUR;
    const points = this.points.filter((point, index, all) => point.time >= start || (all[index + 1]?.time ?? end) > start);
    const live = valueOf(entity);
    if (live !== null) {
      points.push({ time: end, value: live });
    }
    const time = new Intl.DateTimeFormat(language, {
      hour: "numeric",
      minute: "2-digit",
      ...hours > 24 ? { weekday: "short" } : {},
      timeZone: this.hass?.config?.time_zone
    });
    const items = points.map((point) => ({
      time: Math.max(point.time, start),
      value: point.value,
      colour: colourOf(levelOf(shownValue(point.value, precision)) ?? "low"),
      label: `${time.format(point.time)}: ${indexText(point.value, language, precision)}`
    }));
    return b2`<compact-uv-index-chart
            class="chart hourly-chart"
            kind="line"
            .items=${items}
            .start=${start}
            .end=${end}
            .floor=${CHART_FLOOR}
            .language=${language}
            .heading=${this.text("common.hourly_chart", { hours: String(hours) })}
            .brief=${this.text("common.hourly_chart_short", { hours: String(hours) })}
        ></compact-uv-index-chart>`;
  }
  /** The outline's colour given in the configuration; without it the card follows the theme. */
  colours() {
    return this.config?.border_colour ? `--uv-index-outline-color: ${this.config.border_colour}` : "";
  }
  act(gesture) {
    this.dispatchEvent(
      new CustomEvent("hass-action", {
        detail: { config: this.config, action: gesture },
        bubbles: true,
        composed: true
      })
    );
  }
  text(key, values = {}) {
    return Object.entries(values).reduce((text, [name, value]) => text.replace(`{${name}}`, value), translate(this.language(), key));
  }
  language() {
    return this.config?.language || this.hass?.locale?.language || this.hass?.language || browserLanguage();
  }
  static get styles() {
    return i`
            :host {
                display: block;
                height: 100%;
            }

            ha-card {
                display: block;
                height: 100%;
                box-sizing: border-box;
                overflow: hidden;
                container: gauge / inline-size;
            }

            ha-card.tappable {
                cursor: pointer;
            }

            ha-card:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: -2px;
            }

            .content {
                display: flex;
                flex-direction: column;
                height: 100%;
                overflow: hidden;
            }

            .gauge {
                flex: 1 1 auto;
                display: flex;
                align-items: stretch;
                gap: 12px;
                min-height: 56px;
                padding: 8px 14px 8px 10px;
                box-sizing: border-box;
            }

            /*
             * As tall as the gauge and as wide as that height, unless the figures need the room. The drawing is laid
             * over the box rather than in it, so it never makes the gauge taller: the grid, or the figures, decide
             * the height.
             */
            .sun {
                flex: 0 1 auto;
                position: relative;
                width: var(--sun-width, 64px);
                min-width: 24px;
                max-width: 45%;
                min-height: 36px;
            }

            .sun svg {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                overflow: visible;
            }

            .ray {
                stroke: var(--divider-color, rgba(127, 127, 127, 0.3));
                stroke-width: 4px;
                stroke-linecap: round;
                transition: stroke 0.6s ease;
            }

            .glow {
                animation: glow 3s ease-in-out infinite;
            }

            /* A slow breath rather than a blink, so the rays still read as lit at every moment. */
            @keyframes glow {
                50% {
                    opacity: 0.75;
                }
            }

            .disc {
                fill: none;
                stroke: var(--uv-index-outline-color, var(--secondary-text-color));
                stroke-width: 2.5px;
                transition: fill 0.6s ease;
            }

            /* Never narrower than the figures themselves, which are never cut short: the sun gives way instead. */
            .figures {
                flex: 1 0 auto;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 4px;
            }

            .figure {
                display: flex;
                flex-direction: column;
                min-width: 0;
            }

            .label,
            .value {
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            /* A label takes the width the figures have but asks for none, so it is the one cut short. */
            .figure .label {
                width: 0;
                min-width: 100%;
            }

            .label {
                font-size: 12px;
                line-height: 16px;
                color: var(--secondary-text-color);
            }

            .value {
                font-size: 16px;
                line-height: 20px;
                font-weight: 500;
                color: var(--primary-text-color);
            }

            .inline-label {
                display: none;
            }

            /*
             * The level's name in its colour, mixed with the text colour so that yellow stays readable on a light
             * theme and doesn't glare on a dark one.
             */
            .level {
                font-size: 12px;
                line-height: 16px;
                font-weight: 500;
                color: color-mix(in srgb, var(--level-color) 70%, var(--primary-text-color));
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            /*
             * The bars stand on the text's baseline and reach the top of its digits, whatever the font: an inline
             * flex box sits on the baseline, and a cap is the height of a capital or a digit.
             */
            .levels {
                display: inline-flex;
                align-items: flex-end;
                vertical-align: baseline;
                gap: 2px;
                height: 0.7em;
                height: 1cap;
                margin-left: 6px;
            }

            .levels i {
                display: block;
                width: 3px;
                border-radius: 1px;
                background: var(--divider-color, rgba(127, 127, 127, 0.3));
            }

            .levels i:nth-child(1) {
                height: 30%;
            }
            .levels i:nth-child(2) {
                height: 47%;
            }
            .levels i:nth-child(3) {
                height: 65%;
            }
            .levels i:nth-child(4) {
                height: 82%;
            }
            .levels i:nth-child(5) {
                height: 100%;
            }

            .advice {
                flex: none;
                display: flex;
                align-items: baseline;
                gap: 8px;
                margin: 0 10px 8px;
                padding: 0 4px;
                font-size: 12px;
                line-height: 16px;
                color: var(--secondary-text-color);
            }

            .advice .dot {
                flex: none;
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }

            /*
             * The parts under the sun are tiles of their own, as the packages are in package-tracker-card: the
             * peaks, and each chart with its heading under it.
             */
            .extras,
            .chart {
                flex: none;
                margin: 0 10px 8px;
                padding: 6px 10px;
                border-radius: 8px;
                background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
            }

            /* The peaks in equal columns, each its name over its value, with a thin line between them. */
            .extras {
                display: grid;
                grid-auto-columns: minmax(0, 1fr);
                grid-auto-flow: column;
                column-gap: 21px;
                line-height: 16px;
            }

            .extra {
                position: relative;
                display: flex;
                flex-direction: column;
                min-width: 0;
            }

            /* The line sits in the middle of the gap, so that every column is as wide as the others. */
            .extra + .extra::before {
                content: "";
                position: absolute;
                top: 0;
                bottom: 0;
                left: -11px;
                border-left: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
            }

            .extra .label {
                font-size: 11px;
            }

            .extra .amount {
                font-size: 13px;
                font-weight: 500;
                color: var(--primary-text-color);
            }

            .chart {
                padding-top: 8px;
            }

            .content.hide-advice .advice,
            .content.hide-extras .extras,
            .content.hide-daily-chart .daily-chart,
            .content.hide-hourly-chart .hourly-chart {
                display: none;
            }

            .missing {
                padding: 12px 16px;
                color: var(--error-color);
            }

            /* The short names are for the narrowest card. */
            .brief {
                display: none;
            }

            /* Beside the sun but with little room: the index's own label gets short too. */
            @container gauge (max-width: 229px) {
                .now .long {
                    display: none;
                }
                .now .brief {
                    display: inline;
                }
            }

            /* Too narrow for the peaks side by side: one a row, the name left and the value right. */
            @container gauge (max-width: 299px) {
                .extras {
                    grid-auto-flow: row;
                }
                .extra {
                    flex-direction: row;
                    justify-content: space-between;
                    gap: 8px;
                }
                .extra + .extra::before {
                    display: none;
                }
                .extra .label {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .extra .amount {
                    flex: none;
                    white-space: nowrap;
                }
            }

            /* Room to spare: larger figures. */
            @container gauge (min-width: 260px) {
                .gauge {
                    gap: 16px;
                    padding: 10px 18px 10px 14px;
                }
                .figure .label {
                    font-size: 14px;
                    line-height: 18px;
                }
                .value {
                    font-size: 22px;
                    line-height: 28px;
                }
                .level {
                    font-size: 13px;
                    line-height: 17px;
                }
                .advice {
                    margin: 0 14px 10px;
                    font-size: 13px;
                    line-height: 17px;
                }
                .extras,
                .chart {
                    margin: 0 14px 10px;
                    padding-left: 12px;
                    padding-right: 12px;
                }
            }

            /* Narrow: the sun above the figures, without their labels. */
            @container gauge (max-width: 179px) {
                .gauge {
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 8px 6px;
                }
                .sun {
                    flex: 1 1 auto;
                    width: 100%;
                    max-width: 100%;
                    min-height: 44px;
                }
                .figures {
                    flex: none;
                    align-items: center;
                    gap: 0;
                    max-width: 100%;
                }
                .figure {
                    align-items: center;
                    max-width: 100%;
                }
                .figure .label,
                .long {
                    display: none;
                }
                .brief,
                .inline-label {
                    display: inline;
                }
                .value {
                    font-size: 14px;
                    line-height: 18px;
                }
                .peak .value {
                    font-size: 12px;
                    line-height: 16px;
                    font-weight: 400;
                    color: var(--secondary-text-color);
                }
                .advice {
                    margin: 0 6px 6px;
                    padding: 0;
                    font-size: 11px;
                    line-height: 14px;
                }
                .extras,
                .chart {
                    margin: 0 4px 4px;
                    padding-left: 6px;
                    padding-right: 6px;
                }
                .extra {
                    gap: 4px;
                }
                .extra .amount {
                    font-size: 12px;
                }
            }

            /*
             * Low, such as one row of a sections view: the sun beside the figures whatever the width, and the
             * figures without labels, today's peak under the index with a short label of its own. Without one it
             * would be a second bare number, and an index has no unit to tell the two apart.
             */
            .gauge.short {
                flex-direction: row;
                align-items: stretch;
                gap: 8px;
                padding: 6px 10px 6px 8px;
            }
            .gauge.short .sun {
                flex: 0 1 auto;
                width: var(--sun-width, 34px);
                min-width: 16px;
                min-height: 0;
            }
            .gauge.short .figures {
                align-items: stretch;
                gap: 0;
            }
            .gauge.short .figure {
                align-items: flex-start;
            }
            .gauge.short .label,
            .gauge.short .level {
                display: none;
            }
            .gauge.short .inline-label {
                display: inline;
            }
            .gauge.short .value {
                font-size: 15px;
                line-height: 19px;
            }
            .gauge.short .peak .value {
                font-size: 12px;
                line-height: 16px;
                font-weight: 400;
                color: var(--secondary-text-color);
            }

            /* Both low and narrow, the smallest a sections view allows: a little smaller still. */
            @container gauge (max-width: 179px) {
                .gauge.short {
                    gap: 6px;
                    padding: 6px 8px 6px 6px;
                }
                .gauge.short .value {
                    font-size: 13px;
                }
                .gauge.short .peak .value {
                    font-size: 11px;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .ray,
                .disc {
                    transition: none;
                }
                .glow {
                    animation: none;
                }
            }
        `;
  }
};
__decorateClass([
  n4({ attribute: false })
], CompactUvIndexCard.prototype, "hass", 2);
__decorateClass([
  r5()
], CompactUvIndexCard.prototype, "config", 2);
__decorateClass([
  r5()
], CompactUvIndexCard.prototype, "days", 2);
__decorateClass([
  r5()
], CompactUvIndexCard.prototype, "points", 2);
CompactUvIndexCard = __decorateClass([
  t3("compact-uv-index-card")
], CompactUvIndexCard);
export {
  CompactUvIndexCard,
  REFRESH_INTERVAL,
  fitCard
};
