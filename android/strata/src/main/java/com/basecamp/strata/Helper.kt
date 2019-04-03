package com.basecamp.strata

import android.os.Handler
import android.os.Looper
import android.util.Log

/**
 * Guarantees main thread execution, posting a Runnable on
 * the main Looper if necessary. This allows compatibility
 * with unit tests that are already on the main thread.
 */
internal fun runOnUiThread(func: () -> Unit) {
    when (val mainLooper = Looper.getMainLooper()) {
        Looper.myLooper() -> func()
        else -> Handler(mainLooper).post { func() }
    }
}

internal fun log(message: String) {
    if (BuildConfig.DEBUG) {
        Log.d("Strata", "[bridge] $message")
    }
}
