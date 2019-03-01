//
//  Message.swift
//  Strata
//
//  Created by Zach Waugh on 3/1/19.
//  Copyright © 2019 Basecamp. All rights reserved.
//

import Foundation
import WebKit

public typealias MessageData = [String: Any]

public struct Message {
    /// A unique identifier for this message. You can reply to messages by sending
    /// the same message back, or creating a new message with the same id
    public let id: String
    
    /// The component the message is sent from (e.g. - "form", "page", etc)
    public let component: String
    
    /// The event that this message is about: "submit", "display", "send"
    public let event: String
    
    /// Any data to send along with the message, for a "page" component, this might be the ["title": "Page Title"]
    public let data: MessageData
    
    public init(id: String, component: String, event: String, data: MessageData) {
        self.id = id
        self.component = component
        self.event = event
        self.data = data
    }
    
    public func replacing(data updatedData: [String: Any]) -> Message {
        return Message(id: id, component: component, event: event, data: updatedData)
    }
    
    public func merging(data updatedData: [String: Any]) -> Message {
        var mergedData = data
        updatedData.forEach { mergedData[$0] = $1 }
        
        return Message(id: id, component: component, event: event, data: mergedData)
    }
    
    // MARK: JSON
    
    func toJSON() -> [String: Any] {
        return ["id": id, "component": component, "event": event, "data": data]
    }
}

extension Message {
    init?(scriptMessage: WKScriptMessage) {
        guard let message = scriptMessage.body as? [String: Any],
            let id = message["id"] as? String,
            let component = message["component"] as? String,
            let event = message["event"] as? String,
            let data = message["data"] as? MessageData else {
                print("[bridge-event] *** error parsing script message: \(scriptMessage.body)")
                return nil
        }
        
        self.init(id: id, component: component, event: event, data: data)
    }
}

