package com.spendwise

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    // Use PackageList to get all packages automatically
    // This works with New Architecture and handles all packages correctly
    val packageList = PackageList(this).packages

    getDefaultReactHost(
      context = this,
      packageList = packageList,
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
