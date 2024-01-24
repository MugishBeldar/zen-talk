const fs = require('fs');
const path = require('path');

class Module {
    constructor(app, config) {
        this.app = app;
        this.config = config;
    }

    init() {
        this.initAPIs();
    }

    initAPIs() {
        const folder = __dirname;
        fs.readdirSync(folder).filter((file) => {
            const stats = fs.statSync(path.join(folder, file));
            return (file.indexOf('.') !== 0 && stats.isDirectory());
        }).forEach((dir) => {
            fs.readdirSync(path.join(folder, dir)).filter(function (file) {
                const stats = fs.statSync(path.join(folder, dir, file));
                return (file.indexOf('.') !== 0 && !stats.isDirectory() &&
                    file.endsWith('.controller.js'));
            }).forEach((file) => {
                try {
                    const TmpAPI = require(path.join(folder, dir, file));
                    new TmpAPI(this.app, this.config);
                } catch (e) {
                    console.error('Error in init api', path.join(folder, dir, file));
                    console.error(e);
                }
            });
        });
    }
}

module.exports = Module;
