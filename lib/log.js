const path = require('path');

const levelup = require('levelup');
const leveldown = require('leveldown');
const mkdirp = require('mkdirp');

const Hasher = require('./hasher');

class Log {
  constructor(db_name, options={}) {
  	this._storage_dir = options.storage_dir || './storage';
    mkdirp.sync(this._storage_dir);

    this._meta_db_name = db_name;
    this._meta_db_path = path.join(path.resolve(this._storage_dir), this._meta_db_name);
    this._meta_db = levelup(leveldown(this._meta_db_path));

    this._estimated_entries = options.estimated_entries || 1000000;
    this._presence_error_rate = options.error_rate || 0.005;
  }

  // TODO Techincally, we can get in a race condition in this method right now
  init(callback) {
  	if (!this._initialized) {
      this._init_hasher((err) => {
        if (err) {
          callback(err);
        } else {
          this._load_timestamp(callback);
        }
      });
  	} else {
      callback();
  	}
  }

  _init_hasher(callback) {
    this._meta_db.get('hasher_state', (err, value) => {
      if (!err) {
        const hasher_state = JSON.parse(value);
        this._hasher = new Hasher(hasher_state);
        this._initialized = true;
        callback();
      } else if (err.type == 'NotFoundError') {
        this._hasher = new Hasher();
        this._initialized = true;
        callback();
      } else {
        callback(err);
      }
    });
  }

  _load_timestamp(callback) {
    this._meta_db.get('last_timestamp', (err, value) => {
      if (!err) {
        this._last_timestamp = parseInt(value);
        callback();
      } else if (err.type == 'NotFoundError') {
        this._last_timestamp = 0;
        callback();
      } else {
        callback(err);
      }
    });
  }

  log(key, value, callback) {
    this._hasher.update(key, value);
    this._log(key, value, callback);
  }

  _log(key, value, callback) {
    if (this._logging) {
      throw "Cannot log multiple values at once";
    }

    const now = Date.now();
    const timestamp = (now > this._last_timestamp) ? now : this._last_timestamp + 1;
    this._hasher.update(timestamp, key, value);
    this._meta_db.batch()
      .put('last_timestamp', timestamp)
      .put('log_'+timestamp, key+'|'+value)
      .put('hasher_state', this._hasher.serialize())
      .write((err) => {
        if (err) {
          callback(err);
        } else {
          callback();
        }
      });
  }

}

module.exports = Log
