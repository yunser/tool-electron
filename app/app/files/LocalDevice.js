/**
 * Created by cjh1 on 2016/12/13.
 */
const system = require('../../node/system.js');
const fs = require('fs');

class LocalDevice {

    constructor() {

    }

    list(p, call) {
        if (p.startWith('/')) {
            p = path.resolve(system.getUserPath(), p.substring(1)); // TODO bug
        }
        let dirname = p;

        fs.readdir(dirname, (error, files) => {
            if (error) {
                call(error);
                return;
            }

            let result = [];
            let simplePath = dirname.replace(system.getUserPath(), '').replace(/\\/g, '/');
            if (!simplePath.endWith('/')) {
                simplePath += '/';
            }

            let fileNum = 0;

            _.forEach(files.sort(), (files) => {
                let name = files
                let file = dirname + path.sep + files;
                let home = os.platform === "win32" ? process.env.USERPROFILE : process.env.HOME

                fileNum++;
                let stats;
                try {
                    stats = fs.statSync(file);
                } catch (e) {
                    // TODO ?
                    return;
                }


                let type = function() {
                    if (stats.isFile()) {
                        return "file"
                    } else if (stats.isDirectory()) {
                        let split = name.toLowerCase().split(".")
                        let last = split[split.length - 1]

                        if (last === "app") {
                            return "file"
                        } else {
                            return "folder"
                        }
                    } else {
                        return undefined
                    }
                }

                let location = file;
                let size = type() == "folder" ? "—" : normalizeSize(stats.size)
                let modified = moment(stats.mtime).format("MMM D, YYYY")
                let invisible = isHidden(name)
                let check = type() == "file" ? fileType(name) : null
                let icon = function() {
                    if (type() === "file" && !invisible) {
                        return `${fileType(name)}`
                    } else if (type() === "folder") {
                        if (dirname === home && name === "Google Drive") {
                            return "folder_google_drive"
                        } else {
                            return "folder"
                        }
                    } else {
                        return "file"
                    }
                }

                if (!config.showHiddenFiles && invisible) return

                result.push({
                    name: name,
                    size: size,
                    modified: modified,
                    location: simplePath + files,
                    url: file.replace(/\\/g, '/'),
                    type: type,
                    invisible: invisible,
                    icon: icon()
                });

            });

            call(null, result);
            if (fileNum === 0) {
                $('#content-empty').show();
            } else {
                $('#content-empty').hide();
            }
        });
    }

    addFile(file) {
        if (file.startWith('/')) {
            file = path.resolve(system.getUserPath(), file.substring(1)); // TODO bug
        }
        console.log(file)
        system.writeFile(file, '', () => {
            ui.msg('添加成功');
        });
    }

    addFolder(file) {
        if (file.startWith('/')) {
            file = path.resolve(system.getUserPath(), file.substring(1)); // TODO bug
        }
        system.mkdir(file, () => {
            ui.msg('添加成功');
        });
    }

    removeFile(file, call) {
        if (file.startWith('/')) {
            file = path.resolve(system.getUserPath(), file.substring(1)); // TODO bug
        }
        system.removeFile(file, call);
    }

    renameFile(oldFile, newFile) {
        if (oldFile.startWith('/')) {
            oldFile = path.resolve(system.getUserPath(), oldFile.substring(1)); // TODO bug
        }
        if (newFile.startWith('/')) {
            newFile = path.resolve(system.getUserPath(), newFile.substring(1)); // TODO bug
        }
        fs.rename(oldFile, newFile);
    }
}

module.exports = LocalDevice;