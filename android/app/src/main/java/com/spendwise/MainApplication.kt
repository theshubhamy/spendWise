package com.spendwise

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import java.util.ArrayList

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    // Create packages list manually to avoid PackageList accessing null ReactNativeHost
    val packageList = ArrayList<com.facebook.react.ReactPackage>()

    // Get packages from PackageList but handle the null ReactNativeHost issue
    val packageListInstance = PackageList(this)
    // Access packages property which will trigger getPackages()
    // But we need to work around the RNNotificationsPackage issue
    try {
      packageList.addAll(packageListInstance.packages)
    } catch (e: NullPointerException) {
      // If PackageList fails due to null ReactNativeHost, create packages manually
      packageList.add(com.facebook.react.shell.MainReactPackage(null))
      packageList.add(com.reactnativecommunity.asyncstorage.AsyncStoragePackage())
      packageList.add(com.reactcommunity.rndatetimepicker.RNDateTimePickerPackage())
      packageList.add(com.reactnativecommunity.picker.RNCPickerPackage())
      packageList.add(com.reactnativevectoricons.ionicons.VectorIconsIoniconsPackage())
      packageList.add(com.rnbiometrics.ReactNativeBiometricsPackage())
      packageList.add(com.swmansion.gesturehandler.RNGestureHandlerPackage())
      packageList.add(org.linusu.RNGetRandomValuesPackage())
      packageList.add(com.oblador.keychain.KeychainPackage())
      packageList.add(com.libsodium.LibsodiumPackage())
      packageList.add(com.margelo.nitro.mmkv.NitroMmkvPackage())
      packageList.add(com.margelo.nitro.NitroModulesPackage())
      packageList.add(com.wix.reactnativenotifications.RNNotificationsPackage(this))
      packageList.add(com.margelo.rnquicksqlite.SequelPackage())
      packageList.add(com.th3rdwave.safeareacontext.SafeAreaContextPackage())
      packageList.add(com.swmansion.rnscreens.RNScreensPackage())
    }

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
