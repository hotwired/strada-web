import XCTest
@testable import Strata

class MessageTests: XCTestCase {
    func testReplacingData() {
        let message = Message(id: "1", component: "test", event: "connect", data: ["title": "test title", "subtitle": "testing"])
        let newMessage = message.replacing(data: ["title": "updated title", "foo": "bar"])
        
        XCTAssertEqual(newMessage.id, "1")
        XCTAssertEqual(newMessage.component, "test")
        XCTAssertEqual(newMessage.event, "connect")
        XCTAssertEqual(newMessage.data, ["title": "updated title", "foo": "bar"])
    }
    
    func testReplacingEventAndData() {
        let message = Message(id: "1", component: "test", event: "connect", data: ["title": "test title", "subtitle": "testing"])
        let newMessage = message.replacing(event: "other-event", data: ["title": "updated title", "foo": "bar"])
        
        XCTAssertEqual(newMessage.id, "1")
        XCTAssertEqual(newMessage.component, "test")
        XCTAssertEqual(newMessage.event, "other-event")
        XCTAssertEqual(newMessage.data, ["title": "updated title", "foo": "bar"])
    }
    
    func testMergingData() {
        let message = Message(id: "1", component: "test", event: "connect", data: ["title": "test title", "subtitle": "testing"])
        let newMessage = message.merging(data: ["title": "updated title"])
        
        XCTAssertEqual(newMessage.id, "1")
        XCTAssertEqual(newMessage.component, "test")
        XCTAssertEqual(newMessage.event, "connect")
        XCTAssertEqual(newMessage.data, ["title": "updated title", "subtitle": "testing"])
    }
    
    func testToJSON() {
        let message = Message(id: "1", component: "test", event: "connect", data: ["title": "test"])
        let json = message.toJSON()
        
        XCTAssertEqual(json, [
            "id": "1",
            "component": "test",
            "event": "connect",
            "data": [
                "title": "test"
            ]
        ])
    }
}
