/*
Strada 0.9.3
Copyright © 2023 37signals, LLC
*/

// src/bridge.ts
var Bridge = class {
  constructor() {
    this.adapter = null;
    this.lastMessageId = 0;
    this.pendingMessages = [];
    this.pendingCallbacks = /* @__PURE__ */ new Map();
  }
  start() {
    this.notifyApplicationAfterStart();
  }
  notifyApplicationAfterStart() {
    document.dispatchEvent(new Event("web-bridge:ready"));
  }
  supportsComponent(component) {
    if (this.adapter) {
      return this.adapter.supportsComponent(component);
    } else {
      return false;
    }
  }
  send({ component, event, data, callback }) {
    if (!this.adapter) {
      this.savePendingMessage({ component, event, data, callback });
      return null;
    }
    if (!this.supportsComponent(component))
      return null;
    const id = this.generateMessageId();
    const message = { id, component, event, data: data || {} };
    this.adapter.receive(message);
    if (callback) {
      this.pendingCallbacks.set(id, callback);
    }
    return id;
  }
  receive(message) {
    this.executeCallbackFor(message);
  }
  executeCallbackFor(message) {
    const callback = this.pendingCallbacks.get(message.id);
    if (callback) {
      callback(message);
    }
  }
  removeCallbackFor(messageId) {
    if (this.pendingCallbacks.has(messageId)) {
      this.pendingCallbacks.delete(messageId);
    }
  }
  removePendingMessagesFor(component) {
    this.pendingMessages = this.pendingMessages.filter((message) => message.component != component);
  }
  generateMessageId() {
    const id = ++this.lastMessageId;
    return id.toString();
  }
  setAdapter(adapter) {
    this.adapter = adapter;
    document.documentElement.dataset.bridgePlatform = this.adapter.platform;
    this.adapterDidUpdateSupportedComponents();
    this.sendPendingMessages();
  }
  adapterDidUpdateSupportedComponents() {
    if (this.adapter) {
      document.documentElement.dataset.bridgeComponents = this.adapter.supportedComponents.join(" ");
    }
  }
  savePendingMessage(message) {
    this.pendingMessages.push(message);
  }
  sendPendingMessages() {
    this.pendingMessages.forEach((message) => this.send(message));
    this.pendingMessages = [];
  }
};

// node_modules/stimulus/dist/stimulus.js
function camelize(value) {
  return value.replace(/(?:[_-])([a-z0-9])/g, (_, char) => char.toUpperCase());
}
function namespaceCamelize(value) {
  return camelize(value.replace(/--/g, "-").replace(/__/g, "_"));
}
function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
function dasherize(value) {
  return value.replace(/([A-Z])/g, (_, char) => `-${char.toLowerCase()}`);
}
function readInheritableStaticArrayValues(constructor, propertyName) {
  const ancestors = getAncestorsForConstructor(constructor);
  return Array.from(ancestors.reduce((values, constructor2) => {
    getOwnStaticArrayValues(constructor2, propertyName).forEach((name) => values.add(name));
    return values;
  }, /* @__PURE__ */ new Set()));
}
function readInheritableStaticObjectPairs(constructor, propertyName) {
  const ancestors = getAncestorsForConstructor(constructor);
  return ancestors.reduce((pairs, constructor2) => {
    pairs.push(...getOwnStaticObjectPairs(constructor2, propertyName));
    return pairs;
  }, []);
}
function getAncestorsForConstructor(constructor) {
  const ancestors = [];
  while (constructor) {
    ancestors.push(constructor);
    constructor = Object.getPrototypeOf(constructor);
  }
  return ancestors.reverse();
}
function getOwnStaticArrayValues(constructor, propertyName) {
  const definition = constructor[propertyName];
  return Array.isArray(definition) ? definition : [];
}
function getOwnStaticObjectPairs(constructor, propertyName) {
  const definition = constructor[propertyName];
  return definition ? Object.keys(definition).map((key) => [key, definition[key]]) : [];
}
var getOwnKeys = (() => {
  if (typeof Object.getOwnPropertySymbols == "function") {
    return (object) => [...Object.getOwnPropertyNames(object), ...Object.getOwnPropertySymbols(object)];
  } else {
    return Object.getOwnPropertyNames;
  }
})();
var extend = (() => {
  function extendWithReflect(constructor) {
    function extended() {
      return Reflect.construct(constructor, arguments, new.target);
    }
    extended.prototype = Object.create(constructor.prototype, {
      constructor: { value: extended }
    });
    Reflect.setPrototypeOf(extended, constructor);
    return extended;
  }
  function testReflectExtension() {
    const a = function() {
      this.a.call(this);
    };
    const b = extendWithReflect(a);
    b.prototype.a = function() {
    };
    return new b();
  }
  try {
    testReflectExtension();
    return extendWithReflect;
  } catch (error) {
    return (constructor) => class extended extends constructor {
    };
  }
})();
var defaultSchema = {
  controllerAttribute: "data-controller",
  actionAttribute: "data-action",
  targetAttribute: "data-target",
  targetAttributeForScope: (identifier) => `data-${identifier}-target`,
  outletAttributeForScope: (identifier, outlet) => `data-${identifier}-${outlet}-outlet`,
  keyMappings: Object.assign(Object.assign({ enter: "Enter", tab: "Tab", esc: "Escape", space: " ", up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", home: "Home", end: "End" }, objectFromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c) => [c, c]))), objectFromEntries("0123456789".split("").map((n) => [n, n])))
};
function objectFromEntries(array) {
  return array.reduce((memo, [k, v]) => Object.assign(Object.assign({}, memo), { [k]: v }), {});
}
function ClassPropertiesBlessing(constructor) {
  const classes = readInheritableStaticArrayValues(constructor, "classes");
  return classes.reduce((properties, classDefinition) => {
    return Object.assign(properties, propertiesForClassDefinition(classDefinition));
  }, {});
}
function propertiesForClassDefinition(key) {
  return {
    [`${key}Class`]: {
      get() {
        const { classes } = this;
        if (classes.has(key)) {
          return classes.get(key);
        } else {
          const attribute = classes.getAttributeName(key);
          throw new Error(`Missing attribute "${attribute}"`);
        }
      }
    },
    [`${key}Classes`]: {
      get() {
        return this.classes.getAll(key);
      }
    },
    [`has${capitalize(key)}Class`]: {
      get() {
        return this.classes.has(key);
      }
    }
  };
}
function OutletPropertiesBlessing(constructor) {
  const outlets = readInheritableStaticArrayValues(constructor, "outlets");
  return outlets.reduce((properties, outletDefinition) => {
    return Object.assign(properties, propertiesForOutletDefinition(outletDefinition));
  }, {});
}
function propertiesForOutletDefinition(name) {
  const camelizedName = namespaceCamelize(name);
  return {
    [`${camelizedName}Outlet`]: {
      get() {
        const outlet = this.outlets.find(name);
        if (outlet) {
          const outletController = this.application.getControllerForElementAndIdentifier(outlet, name);
          if (outletController) {
            return outletController;
          } else {
            throw new Error(`Missing "data-controller=${name}" attribute on outlet element for "${this.identifier}" controller`);
          }
        }
        throw new Error(`Missing outlet element "${name}" for "${this.identifier}" controller`);
      }
    },
    [`${camelizedName}Outlets`]: {
      get() {
        const outlets = this.outlets.findAll(name);
        if (outlets.length > 0) {
          return outlets.map((outlet) => {
            const controller = this.application.getControllerForElementAndIdentifier(outlet, name);
            if (controller) {
              return controller;
            } else {
              console.warn(`The provided outlet element is missing the outlet controller "${name}" for "${this.identifier}"`, outlet);
            }
          }).filter((controller) => controller);
        }
        return [];
      }
    },
    [`${camelizedName}OutletElement`]: {
      get() {
        const outlet = this.outlets.find(name);
        if (outlet) {
          return outlet;
        } else {
          throw new Error(`Missing outlet element "${name}" for "${this.identifier}" controller`);
        }
      }
    },
    [`${camelizedName}OutletElements`]: {
      get() {
        return this.outlets.findAll(name);
      }
    },
    [`has${capitalize(camelizedName)}Outlet`]: {
      get() {
        return this.outlets.has(name);
      }
    }
  };
}
function TargetPropertiesBlessing(constructor) {
  const targets = readInheritableStaticArrayValues(constructor, "targets");
  return targets.reduce((properties, targetDefinition) => {
    return Object.assign(properties, propertiesForTargetDefinition(targetDefinition));
  }, {});
}
function propertiesForTargetDefinition(name) {
  return {
    [`${name}Target`]: {
      get() {
        const target = this.targets.find(name);
        if (target) {
          return target;
        } else {
          throw new Error(`Missing target element "${name}" for "${this.identifier}" controller`);
        }
      }
    },
    [`${name}Targets`]: {
      get() {
        return this.targets.findAll(name);
      }
    },
    [`has${capitalize(name)}Target`]: {
      get() {
        return this.targets.has(name);
      }
    }
  };
}
function ValuePropertiesBlessing(constructor) {
  const valueDefinitionPairs = readInheritableStaticObjectPairs(constructor, "values");
  const propertyDescriptorMap = {
    valueDescriptorMap: {
      get() {
        return valueDefinitionPairs.reduce((result, valueDefinitionPair) => {
          const valueDescriptor = parseValueDefinitionPair(valueDefinitionPair, this.identifier);
          const attributeName = this.data.getAttributeNameForKey(valueDescriptor.key);
          return Object.assign(result, { [attributeName]: valueDescriptor });
        }, {});
      }
    }
  };
  return valueDefinitionPairs.reduce((properties, valueDefinitionPair) => {
    return Object.assign(properties, propertiesForValueDefinitionPair(valueDefinitionPair));
  }, propertyDescriptorMap);
}
function propertiesForValueDefinitionPair(valueDefinitionPair, controller) {
  const definition = parseValueDefinitionPair(valueDefinitionPair, controller);
  const { key, name, reader: read, writer: write } = definition;
  return {
    [name]: {
      get() {
        const value = this.data.get(key);
        if (value !== null) {
          return read(value);
        } else {
          return definition.defaultValue;
        }
      },
      set(value) {
        if (value === void 0) {
          this.data.delete(key);
        } else {
          this.data.set(key, write(value));
        }
      }
    },
    [`has${capitalize(name)}`]: {
      get() {
        return this.data.has(key) || definition.hasCustomDefaultValue;
      }
    }
  };
}
function parseValueDefinitionPair([token, typeDefinition], controller) {
  return valueDescriptorForTokenAndTypeDefinition({
    controller,
    token,
    typeDefinition
  });
}
function parseValueTypeConstant(constant) {
  switch (constant) {
    case Array:
      return "array";
    case Boolean:
      return "boolean";
    case Number:
      return "number";
    case Object:
      return "object";
    case String:
      return "string";
  }
}
function parseValueTypeDefault(defaultValue) {
  switch (typeof defaultValue) {
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    case "string":
      return "string";
  }
  if (Array.isArray(defaultValue))
    return "array";
  if (Object.prototype.toString.call(defaultValue) === "[object Object]")
    return "object";
}
function parseValueTypeObject(payload) {
  const typeFromObject = parseValueTypeConstant(payload.typeObject.type);
  if (!typeFromObject)
    return;
  const defaultValueType = parseValueTypeDefault(payload.typeObject.default);
  if (typeFromObject !== defaultValueType) {
    const propertyPath = payload.controller ? `${payload.controller}.${payload.token}` : payload.token;
    throw new Error(`The specified default value for the Stimulus Value "${propertyPath}" must match the defined type "${typeFromObject}". The provided default value of "${payload.typeObject.default}" is of type "${defaultValueType}".`);
  }
  return typeFromObject;
}
function parseValueTypeDefinition(payload) {
  const typeFromObject = parseValueTypeObject({
    controller: payload.controller,
    token: payload.token,
    typeObject: payload.typeDefinition
  });
  const typeFromDefaultValue = parseValueTypeDefault(payload.typeDefinition);
  const typeFromConstant = parseValueTypeConstant(payload.typeDefinition);
  const type = typeFromObject || typeFromDefaultValue || typeFromConstant;
  if (type)
    return type;
  const propertyPath = payload.controller ? `${payload.controller}.${payload.typeDefinition}` : payload.token;
  throw new Error(`Unknown value type "${propertyPath}" for "${payload.token}" value`);
}
function defaultValueForDefinition(typeDefinition) {
  const constant = parseValueTypeConstant(typeDefinition);
  if (constant)
    return defaultValuesByType[constant];
  const defaultValue = typeDefinition.default;
  if (defaultValue !== void 0)
    return defaultValue;
  return typeDefinition;
}
function valueDescriptorForTokenAndTypeDefinition(payload) {
  const key = `${dasherize(payload.token)}-value`;
  const type = parseValueTypeDefinition(payload);
  return {
    type,
    key,
    name: camelize(key),
    get defaultValue() {
      return defaultValueForDefinition(payload.typeDefinition);
    },
    get hasCustomDefaultValue() {
      return parseValueTypeDefault(payload.typeDefinition) !== void 0;
    },
    reader: readers[type],
    writer: writers[type] || writers.default
  };
}
var defaultValuesByType = {
  get array() {
    return [];
  },
  boolean: false,
  number: 0,
  get object() {
    return {};
  },
  string: ""
};
var readers = {
  array(value) {
    const array = JSON.parse(value);
    if (!Array.isArray(array)) {
      throw new TypeError(`expected value of type "array" but instead got value "${value}" of type "${parseValueTypeDefault(array)}"`);
    }
    return array;
  },
  boolean(value) {
    return !(value == "0" || String(value).toLowerCase() == "false");
  },
  number(value) {
    return Number(value);
  },
  object(value) {
    const object = JSON.parse(value);
    if (object === null || typeof object != "object" || Array.isArray(object)) {
      throw new TypeError(`expected value of type "object" but instead got value "${value}" of type "${parseValueTypeDefault(object)}"`);
    }
    return object;
  },
  string(value) {
    return value;
  }
};
var writers = {
  default: writeString,
  array: writeJSON,
  object: writeJSON
};
function writeJSON(value) {
  return JSON.stringify(value);
}
function writeString(value) {
  return `${value}`;
}
var Controller = class {
  constructor(context) {
    this.context = context;
  }
  static get shouldLoad() {
    return true;
  }
  static afterLoad(_identifier, _application) {
    return;
  }
  get application() {
    return this.context.application;
  }
  get scope() {
    return this.context.scope;
  }
  get element() {
    return this.scope.element;
  }
  get identifier() {
    return this.scope.identifier;
  }
  get targets() {
    return this.scope.targets;
  }
  get outlets() {
    return this.scope.outlets;
  }
  get classes() {
    return this.scope.classes;
  }
  get data() {
    return this.scope.data;
  }
  initialize() {
  }
  connect() {
  }
  disconnect() {
  }
  dispatch(eventName, { target = this.element, detail = {}, prefix = this.identifier, bubbles = true, cancelable = true } = {}) {
    const type = prefix ? `${prefix}:${eventName}` : eventName;
    const event = new CustomEvent(type, { detail, bubbles, cancelable });
    target.dispatchEvent(event);
    return event;
  }
};
Controller.blessings = [
  ClassPropertiesBlessing,
  TargetPropertiesBlessing,
  ValuePropertiesBlessing,
  OutletPropertiesBlessing
];
Controller.targets = [];
Controller.outlets = [];
Controller.values = {};

// src/bridge_element.ts
var BridgeElement = class {
  constructor(element) {
    this.element = element;
  }
  get title() {
    return (this.bridgeAttribute("title") || this.attribute("aria-label") || this.element.textContent || this.element.value).trim();
  }
  get enabled() {
    return !this.disabled;
  }
  get disabled() {
    const disabled = this.bridgeAttribute("disabled");
    return disabled === "true" || disabled === this.platform;
  }
  enableForComponent(component) {
    if (component.enabled) {
      this.removeBridgeAttribute("disabled");
    }
  }
  hasClass(className) {
    return this.element.classList.contains(className);
  }
  attribute(name) {
    return this.element.getAttribute(name);
  }
  bridgeAttribute(name) {
    return this.attribute(`data-bridge-${name}`);
  }
  setBridgeAttribute(name, value) {
    this.element.setAttribute(`data-bridge-${name}`, value);
  }
  removeBridgeAttribute(name) {
    this.element.removeAttribute(`data-bridge-${name}`);
  }
  click() {
    if (this.platform == "android") {
      this.element.removeAttribute("target");
    }
    this.element.click();
  }
  get platform() {
    return document.documentElement.dataset.bridgePlatform;
  }
};

// src/helpers/user_agent.ts
var { userAgent } = window.navigator;
var isStradaMobileApp = /bridge-components: \[.+\]/.test(userAgent);

// src/bridge_component.ts
var BridgeComponent = class extends Controller {
  constructor() {
    super(...arguments);
    this.pendingMessageCallbacks = [];
  }
  static get shouldLoad() {
    return isStradaMobileApp;
  }
  initialize() {
    this.pendingMessageCallbacks = [];
  }
  connect() {
  }
  disconnect() {
    this.removePendingCallbacks();
    this.removePendingMessages();
  }
  get component() {
    return this.constructor.component;
  }
  get platformOptingOut() {
    const { bridgePlatform } = document.documentElement.dataset;
    return this.identifier == this.element.getAttribute(`data-controller-optout-${bridgePlatform}`);
  }
  get enabled() {
    return !this.platformOptingOut && this.bridge.supportsComponent(this.component);
  }
  send(event, data = {}, callback) {
    data.metadata = {
      url: window.location.href
    };
    const message = { component: this.component, event, data, callback };
    const messageId = this.bridge.send(message);
    if (callback) {
      this.pendingMessageCallbacks.push(messageId);
    }
  }
  removePendingCallbacks() {
    this.pendingMessageCallbacks.forEach((messageId) => this.bridge.removeCallbackFor(messageId));
  }
  removePendingMessages() {
    this.bridge.removePendingMessagesFor(this.component);
  }
  get bridgeElement() {
    return new BridgeElement(this.element);
  }
  get bridge() {
    return window.Strada.web;
  }
};
BridgeComponent.component = "";

// src/index.ts
if (!window.Strada) {
  const webBridge = new Bridge();
  window.Strada = { web: webBridge };
  webBridge.start();
}
export {
  BridgeComponent,
  BridgeElement
};
