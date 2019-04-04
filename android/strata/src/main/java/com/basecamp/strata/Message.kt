package com.basecamp.strata

import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import com.google.gson.reflect.TypeToken

typealias MessageData = HashMap<String, Any>

/**
 * Convenience function to clear the current data
 * entries and add the provided Pair entries.
 */
fun MessageData.set(vararg entries: Pair<String, Any>) = apply {
    clear()
    entries.forEach { put(it.first, it.second) }
}

data class Message(
    /**
     * A unique identifier for this message. You can reply to messages by sending
     * the same message back, or creating a new message with the same id
     */
    @SerializedName("id") val id: String,

    /**
     * The component the message is sent from (e.g. - "form", "page", etc)
     */
    @SerializedName("component") val component: String,

    /**
     * The event that this message is about: "submit", "display", "send"
     */
    @SerializedName("event") val event: String,

    /**
     * Any data to send along with the message, for a "page" component,
     * this might be the ["title": "Page Title"]
     */
    @SerializedName("data") val data: MessageData = MessageData()
) {
    fun toJSON(): String {
        return Gson().toJson(this)
    }

    companion object {
        fun fromJSON(json: String?): Message? = try {
            val type = object : TypeToken<Message>() {}.type
            Gson().fromJson<Message>(json, type)
        } catch (e: Exception) {
            log("Invalid message: $json")
            null
        }
    }
}
