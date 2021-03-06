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
4. Check requirements and install if not available: `cordova requirements` (see https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html)
   * Install Android Studio
   * Download Gradle seperatly and add to path
   * Add to path environment variable: %LOCALAPPDATA%/Android/Sdk/platform-tools;%LOCALAPPDATA%/Android\Sdk\build-tools\29.0.3
   * Add environment varialbe JAVA_HOME=C:\Program Files\Android\Android Studio\jre
5. Build app: `cordova build android`
  * To build electron, in package.json remove     `"cordova-ourcodeworld-filebrowser": "git+https://github.com/ourcodeworld/cordova-ourcodeworld-filebrowser.git",` and `"com.ourcodeworld.plugins.Filebrowser": {}`
6. Run emulator: `cordova emulate android`
