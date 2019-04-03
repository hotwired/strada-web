package com.basecamp.strata

import android.os.Handler
import android.os.Looper
import android.util.Log

internal fun runOnUiThread(func: () -> Unit) {
    if (Looper.myLooper() != Looper.getMainLooper()) {
        Handler(Looper.getMainLooper()).post { func() }
    } else {
        // Avoid posting a runnable if it's not necessary,
        // which also creates an easier ability to unit test.
        func()
    }
}

internal fun log(message: String) {
    if (BuildConfig.DEBUG) {
        Log.d("Strata", "[bridge] $message")
    }
}
