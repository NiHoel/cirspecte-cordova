# Setup
0. Update submodules: git submodule update --init --recursive
1. Install node.js from: https://nodejs.org/
2. Install cordova: `npm install -g cordova`
3. Add platforms: 
  * `cordova platform add browser`
  * `cordova platform add android`
4. Check requirements and install if not available: `cordova requirements`
5. Install corcova plugins:
  * `cordova plugin add cordova-plugin-file`
  * `cordova plugin add cordova-plugin-whitelist`
  * `cordova plugin add cordova-plugin-geolocation`
6. Build app: `cordova build android`
7. Run emulator: `cordova emulate android`
