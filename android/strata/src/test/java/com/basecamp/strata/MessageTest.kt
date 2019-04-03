package com.basecamp.strata

import org.junit.Assert.assertEquals
import org.junit.Test

class MessageTest {
    @Test
    fun toJson() {
        val json = """{"id":"1","component":"page","event":"connect","data":{"title":"Page title"}}"""
        val message = Message(
            id = "1",
            component = "page",
            event = "connect",
            data = hashMapOf("title" to "Page title")
        )

        assertEquals(message.toJSON(), json)
    }

    @Test
    fun fromJson() {
        val json = """{"id":"1","component":"page","event":"connect","data":{"title":"Page title"}}"""
        val message = Message.fromJSON(json)

        assertEquals(message?.id, "1")
        assertEquals(message?.component, "page")
        assertEquals(message?.event, "connect")
        assertEquals(message?.data?.get("title"), "Page title")
    }
}
