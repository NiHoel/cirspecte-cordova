/*
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

const { contextBridge, ipcRenderer, app } = require('electron');
const nodePath = require('path');
const fs = require('fs');
const { cordova } = require('./package.json');

contextBridge.exposeInMainWorld('_cdvElectronIpc', {
    exec: (success, error, serviceName, action, args) => {
        return ipcRenderer.invoke('cdv-plugin-exec', serviceName, action, args)
            .then(
                success,
                error
            );
    },

    hasService: (serviceName) => cordova &&
        cordova.services &&
        cordova.services[serviceName]
});

ipcRenderer.invoke('cdv-plugin-file-paths-prefix').then(pathsPrefix => {


    const promisify = function (f) {
        return function (...args) { // return a wrapper-function (*)
            return new Promise((resolve, reject) => {
                function callback(err, result) { // our custom callback for f (**)
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }

                args.push(callback); // append our custom callback to the end of f arguments

                f.call(this, ...args); // call the original function
            });
        };
    };

    contextBridge.exposeInMainWorld(
        "electron", {
        "ipcRenderer": {
            send: (channel, data) => {
                // whitelist channels
                let validChannels = ["fs-request", "fs-create"];
                if (validChannels.includes(channel)) {
                    ipcRenderer.send(channel, data);
                }
            },
            on: (channel, func) => {
                let validChannels = ["fs-response"];
                if (validChannels.includes(channel)) {
                    ipcRenderer.on(channel, func);
                }
            },
            off: (channel, func) => {
                let validChannels = ["fs-response"];
                ipcRenderer.off(channel, func);
            }
        },
        "file": {
            "pathsPrefix": pathsPrefix
        },
        "path": {
            basename: (...args) => nodePath.basename(...args),
            dirname: (...args) => nodePath.dirname(...args),
            sep: nodePath.sep
        },
        "fs": {
            readdir: (...args) => fs.readdir(...args),
            stat: (path, callback) => {
                fs.stat(path, {}, (err, stats) => {
                    if (stats) {
                        for (var getter of ['isDirectory', 'isFile', 'isBlockDevice', 'isCharacterDevice', 'isFIFO', 'isSocket', 'isSymbolicLink']) {
                            try {
                                const val = stats[getter]();
                                stats[getter] = function () { return val; };
                            } catch (e) { }
                        }
                    }

                    callback(err, stats);

                });
            },
            'open': (...args) => fs.open(...args),
            'close': (...args) => fs.close(...args),
            utime: function (successCallback, errorCallback, args) {
                const fileName = args[0];
                const data = args[1];
                const position = args[2];
                const isBinary = args[3]; // eslint-disable-line no-unused-vars

                if (!data) {
                    if (errorCallback) {
                        errorCallback(9 /*FileError.INVALID_MODIFICATION_ERR*/);
                    }
                    return;
                }

                const buf = Buffer.from(data);
                const promisify = nodeRequire('util').promisify;
                let bytesWritten = 0;
                promisify(fs.open)(fileName, 'a')
                    .then(fd => {
                        return promisify(fs.write)(fd, buf, 0, buf.length, position)
                            .then(bw => { bytesWritten = bw; })
                            .finally(() => promisify(fs.close)(fd));
                    })
                    .then(() => successCallback(bytesWritten))
                    .catch(() => {
                        if (errorCallback) {
                            errorCallback(9 /*FileError.INVALID_MODIFICATION_ERR*/);
                        }
                    });
            },
            write: function (successCallback, errorCallback, args) {
                const fileName = args[0];
                const data = args[1];
                const position = args[2];
                const isBinary = args[3]; // eslint-disable-line no-unused-vars

                if (!data) {
                    if (errorCallback) {
                        errorCallback(9 /*FileError.INVALID_MODIFICATION_ERR*/);
                    }
                    return;
                }

                const buf = Buffer.from(data);
                let bytesWritten = 0;
                promisify(fs.open)(fileName, 'a')
                    .then(fd => {
                        return promisify(fs.write)(fd, buf, 0, buf.length, position)
                            .then(bw => { bytesWritten = bw; })
                            .finally(() => promisify(fs.close)(fd));
                    })
                    .then(() => successCallback(bytesWritten))
                    .catch(() => {
                        if (errorCallback) {
                            errorCallback(9 /*FileError.INVALID_MODIFICATION_ERR*/);
                        }
                    });
            },
            rmdir: (...args) => fs.rmdir(...args),
            unlink: (...args) => fs.unlink(...args),
            truncate: (...args) => fs.truncate(...args),
            mkdir: (...args) => fs.mkdir(...args),
            copyFile: (...args) => fs.copyFile(...args),
            read: (...args) => fs.read(...args),
            readAs: function (what, fullPath, encoding, startPos, endPos, successCallback, errorCallback) {
                fs.open(fullPath, 'r', (err, fd) => {
                    if (err) {
                        if (errorCallback) {
                            errorCallback(1 /*FileError.NOT_FOUND_ERR*/);
                        }
                        return;
                    }
                    
                    // We could use a Uint8Array here and move the code into FileProxy.js, 
                    //but then we would need to re-implement the toString() methods of the Buffer
                    const buf = Buffer.alloc(endPos - startPos);
                    promisify(fs.read)(fd, buf, 0, buf.length, startPos)
                        .then(() => {
                            switch (what) {
                                case 'text':
                                    successCallback(buf.toString(encoding));
                                    break;
                                case 'dataURL':
                                    successCallback('data:;base64,' + buf.toString('base64'));
                                    break;
                                case 'arrayBuffer':
                                    successCallback(buf);
                                    break;
                                case 'binaryString':
                                    successCallback(buf.toString('binary'));
                                    break;
                            }
                        })
                        .catch(() => {
                            if (errorCallback) {
                                errorCallback(4 /*FileError.NOT_READABLE_ERR*/);
                            }
                        })
                        .then(() => promisify(fs.close)(fd));
                });
            },
            readEntries: function (successCallback, errorCallback, args) {
                const fullPath = args[0];

                if (typeof successCallback !== 'function') {
                    throw Error('Expected successCallback argument.');
                }

                //If we move this code to FileProxy.js, we would have to add a isDirectory() and isFile() method to every entry in files 
                //because the methods we can access in this context will not be copied
                fs.readdir(fullPath, { withFileTypes: true }, (err, files) => {
                    if (err) {
                        if (errorCallback) {
                            errorCallback(1 /*FileError.NOT_FOUND_ERR*/);
                        }
                        return;
                    }
                    const result = [];
                    files.forEach(d => {
                        let path = fullPath + d.name;
                        if (d.isDirectory()) {
                            path += nodePath.sep;
                        }
                        result.push({
                            isDirectory: d.isDirectory(),
                            isFile: d.isFile(),
                            name: d.name,
                            fullPath: path,
                            filesystemName: 'temporary',
                            nativeURL: path
                        });
                    });
                    successCallback(result);
                });
            },
            removeRecursively: function (successCallback, errorCallback, args) {
                const fullPath = args[0];
                const rimraf = require('rimraf');

                rimraf(fullPath, { disableGlob: true }, err => {
                    if (err) {
                        if (errorCallback) {
                            errorCallback(6 /*FileError.NO_MODIFICATION_ALLOWED_ERR*/);
                        }
                        return;
                    }
                    successCallback();
                });
            }
        }
    }
    );

});