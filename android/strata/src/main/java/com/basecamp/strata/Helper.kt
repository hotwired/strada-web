package com.basecamp.strata

import android.util.Log

internal fun log(message: String) {
    if (BuildConfig.DEBUG) {
        Log.d("Strata", "[bridge] $message")
    }
}
