/**
 * @fileOverview This file provides a nodejs module to maintain a database like system.
 * @author Michael Vanderheeren (michael.vanderheeren@addestino.be)
 * @version 0.1
 */

(function() {
    var nosqlite    = module.exports;
    var path        = require('path');
    var fs          = require('fs');
    var _           = require('underscore');

    nosqlite.path = path.join(__dirname, '..', 'data');

    nosqlite.Connection = function(arg) {
        var options;
        options = {};
        this.path = nosqlite.path;

        if (typeof arg === 'object') {
            options = arg;
            this.path = options.path;
        } else if (typeof arg === 'string') {
            this.path = arg;
        }

        return this.path;
    };

    nosqlite.Connection.prototype.database = function(name, mode) {
        var that = this;

        var dir = path.resolve(that.path, name);
        name = name || 'test';
        mode = mode || '0775';

        var file = function(id) {
            return path.resolve(this.dir, id + '.json');
        };

        var project = function(onto, from) {
            return _.extend(onto, from);
        };

        var write = function(id, data) {
            fs.writeFileSync(this.file('.' + id), data);
            return fs.renameSync(this.file('.' + id), this.file(id));
        };

        var exists = function() {
            return path.existsSync(this.dir);
        };

        var create = function() {
            return fs.mkdirSync(this.dir, this.mode);
        };

        var destroy = function() {
            var files = fs.readdirSync(this.dir);
            var dir = this.dir;
            _.each(files, function(file) {
                if (file.substring(0,1) == '.') return;
                fs.unlinkSync(dir+'/'+file);
            });
            fs.rmdirSync(this.dir);
        };

        var truncate = function() {
            var files = fs.readdirSync(this.dir);
            var dir = this.dir;
            _.each(files, function(file) {
                if (file.substring(0,1) == '.') return;
                fs.unlinkSync(dir+'/'+file);
            });
        };

        var get = function(id) {
            try {
                return JSON.parse(fs.readFileSync(this.file(id), 'utf8'));
            }
            catch(err) {
                return null;
            }
        };

        var remove = function(id) {
            return fs.unlinkSync(this.file(id));
        };

        var update = function(id, obj) {
            var data = this.project(this.get(id), obj);
            this.save(id, data);
            return data;
        };

        var save = function(id, obj) {
            obj.id = id;
            return this.write(id, JSON.stringify(obj, null, 2));
        };

        var find = function(cond) {
            return _.where(this.all(), cond);
        };

        var all = function() {
            var _this = this;
            var files = _.filter(fs.readdirSync(this.dir), function(file) {
                return file.substring(0,1) !== '.';
            });
            var data = _.map(files, function(file) {
                return _this.get(path.basename(file, '.json'));
            });

            return _.compact(data);
        };

        var count = function() {
            var _this = this;
            var files = _.filter(fs.readdirSync(this.dir), function(file) {
                return file.substring(0,1) !== '.';
            });
            return files.length;
        };

        return {
            dir: dir,
            name: name,
            mode: mode,
            file: file,
            project: project,
            truncate: truncate,
            write: write,
            exists: exists,
            create: create,
            destroy: destroy,
            get: get,
            remove: remove,
            update: update,
            save: save,
            find: find,
            all: all,
            count: count
        };
    };
}).call(this);
