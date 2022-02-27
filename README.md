# Setup
0. Update submodules: git submodule update --init --recursive
1. Install node.js from: https://nodejs.org/ (add installation directory to path environment variable)
2. Install cordova: `npm install -g cordova`
3. Fetch plugins and platforms: `cordova prepare`
   Manual:
   * `cordova platform add browser`
   * `cordova platform add android@latest` or `cordova platform add android@6.2.1` 
   * `cordova platform add electron`
   * `cordova plugin add cordova-plugin-file`
   * `cordova plugin add cordova-plugin-whitelist`
   * `cordova plugin add cordova-plugin-geolocation`
   * `cordova plugin add https://github.com/ourcodeworld/cordova-ourcodeworld-filebrowser.git` 
4. Ensure that the cordova-file-plugin is installed that works with electron: `cordova plugin add https://github.com/zorn-v/cordova-plugin-file.git#electron`
    Remove the entry `"cordova-plugin-file": "github:zorn-v/cordova-plugin-file#electron",` in package.json afterwards. If the entry is in package.json, cordova does not recognize the path specification and will not add the file plugin.
5. Check requirements and install if not available: `cordova requirements` (see https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html)
   * Install Android Studio
   * Download Gradle seperatly and add to path
   * Add to path environment variable: %LOCALAPPDATA%/Android/Sdk/platform-tools;%LOCALAPPDATA%/Android\Sdk\build-tools\29.0.3
   * Add environment varialbe JAVA_HOME=C:\Program Files\Android\Android Studio\jre
6. Build app: `cordova build android`
  * To build electron, in package.json remove     `"cordova-ourcodeworld-filebrowser": "git+https://github.com/ourcodeworld/cordova-ourcodeworld-filebrowser.git",` and `"com.ourcodeworld.plugins.Filebrowser": {}`
7. Run emulator: `cordova emulate android`

# Troubleshooting
* cordova requirements fails with android target not found because avdmanager list target throws an exception: 
 * Cause: There is an old on under %ANDROID_HOME%/tools
 * Solution: Download the latest comdline-tools in android studio, delete the old tools folder and execute: mklink /J %ANDROID_HOME%\tools %ANDROID_HOME%\cmdline-tools\latest
* Building android does not start but gives message: No Java files found that extend CordovaActivity.
 * Solution: Re-add platform and remove whitelist plugin:
  * cordova platform rm android
  * cordova platform add android
  * cordova plugin rm whitelist