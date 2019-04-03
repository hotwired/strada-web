package com.basecamp.strata

import android.content.Context

class Repository {
    fun getUserScript(context: Context): String {
        return context.assets.open("js/strata.js").use {
            String(it.readBytes())
        }
    }
}
