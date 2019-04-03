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

        assertEquals(json, message.toJSON())
    }

    @Test
    fun fromJson() {
        val json = """{"id":"1","component":"page","event":"connect","data":{"title":"Page title"}}"""
        val message = Message.fromJSON(json)

        assertEquals("1", message?.id)
        assertEquals("page", message?.component)
        assertEquals("connect", message?.event)
        assertEquals("Page title", message?.data?.get("title"))
    }
}
