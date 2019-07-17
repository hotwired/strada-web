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
      default_1.prototype.send = function (component, event, data, callback) {
          if (!this.adapter) {
              var message_1 = [component, event, data, callback];
              this.pendingMessages.push(message_1);
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
      default_1.prototype.generateMessageId = function () {
          var id = ++this.lastMessageId;
          return id.toString();
      };
      default_1.prototype.setAdapter = function (adapter) {
          this.adapter = adapter;
          document.documentElement.dataset.bridgePlatform = this.adapter.platform;
          this.adapterDidUpdateSupportedComponents();
          this.sendPendingMessages();
      };
      default_1.prototype.adapterDidUpdateSupportedComponents = function () {
          document.documentElement.dataset.bridgeComponents = this.adapter.supportedComponents.join(" ");
      };
      default_1.prototype.sendPendingMessages = function () {
          var _this = this;
          this.pendingMessages.forEach(function (message) { return _this.send.apply(_this, message); });
          this.pendingMessages = [];
      };
      return default_1;
  }());

  var bridge = new default_1();
  window.webBridge = bridge;
  bridge.start();

}));
//# sourceMappingURL=strata.js.map
