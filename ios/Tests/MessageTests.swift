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
    
    func testMergingData() {
        let message = Message(id: "1", component: "test", event: "connect", data: ["title": "test title", "subtitle": "testing"])
        let newMessage = message.merging(data: ["title": "updated title"])
        
        XCTAssertEqual(newMessage.id, "1")
        XCTAssertEqual(newMessage.component, "test")
        XCTAssertEqual(newMessage.event, "connect")
        XCTAssertEqual(newMessage.data, ["title": "updated title", "subtitle": "testing"])
    }
}
