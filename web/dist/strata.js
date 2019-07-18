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
          this.lastMessageId = 0;
          this.pendingMessages = [];
          this.pendingCallbacks = new Map();
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
      default_1.prototype.send = function (_a) {
          var component = _a.component, event = _a.event, data = _a.data, callback = _a.callback;
          if (!this.adapterReady) {
              this.savePendingMessage({ component: component, event: event, data: data, callback: callback });
              return;
          }
          if (!this.supportsComponent(component))
              return null;
          var id = this.generateMessageId();
          var message = { id: id, component: component, event: event, data: data || {} };
          this.adapter.receive(message);
          if (callback) {
              this.pendingCallbacks.set(id, callback);
          }
          return id;
      };
      default_1.prototype.receive = function (message) {
          this.executeCallbackFor(message);
      };
      default_1.prototype.executeCallbackFor = function (message) {
          if (this.pendingCallbacks.has(message.id)) {
              var callback = this.pendingCallbacks.get(message.id);
              callback(message);
          }
      };
      default_1.prototype.removeCallbackFor = function (messageId) {
          if (this.pendingCallbacks.has(messageId)) {
              this.pendingCallbacks["delete"](messageId);
          }
      };
      default_1.prototype.removePendingMessagesFor = function (component) {
          this.pendingMessages = this.pendingMessages.filter(function (message) { return message.component != component; });
      };
      default_1.prototype.generateMessageId = function () {
          var id = ++this.lastMessageId;
          return id.toString();
      };
      default_1.prototype.setAdapter = function (adapter) {
          this.adapter = adapter;
          document.documentElement.dataset.bridgePlatform = this.adapter.platform;
          this.adapterDidUpdateSupportedComponents();
      };
      default_1.prototype.adapterDidUpdateSupportedComponents = function () {
          document.documentElement.dataset.bridgeComponents = this.adapter.supportedComponents.join(" ");
          if (this.adapterReady) {
              this.sendPendingMessages();
          }
      };
      default_1.prototype.adapterReady = function () {
          return this.adapter && this.adapter.supportedComponents.length > 0;
      };
      default_1.prototype.savePendingMessage = function (message) {
          this.pendingMessages.push(message);
      };
      default_1.prototype.sendPendingMessages = function () {
          var _this = this;
          this.pendingMessages.forEach(function (message) { return _this.send(message); });
          this.pendingMessages = [];
      };
      return default_1;
  }());

  var bridge = new default_1();
  window.webBridge = bridge;
  bridge.start();

}));
//# sourceMappingURL=strata.js.map
