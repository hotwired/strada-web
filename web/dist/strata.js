/*
Strata 0.1.0
Copyright © 2019 Basecamp, LLC
 */
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

  var default_1 = (function () {
      function default_1() {
          this.adapter = null;
          this.messageId = 0;
          this.handlers = {};
      }
      default_1.prototype.start = function () {
          this.notifyApplicationAfterStart();
      };
      default_1.prototype.notifyApplicationAfterStart = function () {
          document.dispatchEvent(new Event("web-bridge:ready"));
      };
      default_1.prototype.supportsComponent = function (component) {
          if (this.adapter) {
              return this.adapter.supportsComponent(component);
          }
          else {
              return false;
          }
      };
      default_1.prototype.send = function (component, event, data, callback) {
          if (!this.supportsComponent(component))
              return null;
          var id = this.generateMessageId();
          var message = { id: id, component: component, event: event, data: data || {} };
          this.adapter.receive(message);
          if (callback) {
              this.handlers[id] = callback;
          }
          return message;
      };
      default_1.prototype.receive = function (message) {
          this.executeHandlerFor(message);
          this.removeHandlerFor(message);
      };
      default_1.prototype.executeHandlerFor = function (message) {
          var handler = this.handlers[message.id];
          if (handler) {
              handler(message);
          }
      };
      default_1.prototype.removeHandlerFor = function (message) {
          var handler = this.handlers[message.id];
          if (handler) {
              delete this.handlers[message.id];
          }
      };
      default_1.prototype.generateMessageId = function () {
          var id = ++this.messageId;
          return id.toString();
      };
      default_1.prototype.setAdapter = function (adapter) {
          this.adapter = adapter;
          document.documentElement.dataset.bridgePlatform = this.adapter.platform;
          this.adapterDidUpdateSupportedComponents();
      };
      default_1.prototype.adapterDidUpdateSupportedComponents = function () {
          document.documentElement.dataset.bridgeComponents = this.adapter.supportedComponents.join(" ");
      };
      return default_1;
  }());

  var bridge = new default_1();
  window.WebBridge = bridge;
  bridge.start();

}));
//# sourceMappingURL=strata.js.map
