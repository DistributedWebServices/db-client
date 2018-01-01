const dnode = require('dnode');
const Web3 = require('web3');

const Log = require('./log');

class Client {
  constructor(options={}) {
    this._dnodes = {};
    this._remotes = {};
    this._logs = {};

    this._eth_address = options.eth_address;

    if (this._eth_address) {
      this._ws_endpoint = options.ws_endpoint || 'ws://localhost:8546';
      this.web3 = new Web3(new Web3.providers.WebsocketProvider(this._ws_endpoint));
    }
  }

  connect(host, port, db_name, callback) {
    this._dnodes[db_name] = dnode.connect(port, host);
    this._dnodes[db_name]
      .on('remote', (remote) => {
        const log = new Log(db_name);
        log.init((err) => {
          if (err) {
            callback(err);
          } else {
            this._logs[db_name] = log;
            this._remotes[db_name] = remote;
            callback();
          }
        });
      })
      .on('error', (err) => {
        callback(err);
      }); 
  }

  get(db_name, key, callback) {
    this._remotes[db_name].get(db_name, key, function(err, value) {
      if (err) {
        callback(err);
      } else {
        callback(value);
      }
    });
  }

  put(db_name, key, value, callback) {
    const log = this._logs[db_name];
    log.
    this._remotes[db_name].put(db_name, key, value, function(err) {

    });
  }

  del(db_name, key, callback) {
    this.put(db_name, key, '__deleted__', callback);
  }

  hash_challenge(db_name, salt, callback) {
    this._remotes[db_name].hash_challenge(db_name, salt, function(err, hash) {
      callback(err, hash);
    });
  }

  hash_challenges(db_name, num_salts, callback) {
    var salts = this._logs[db_name]._hasher.get_n_salts(num_salts);
    this._remotes[db_name].hash_challenges(db_name, salts, function(err, hashes) {
      callback(err, hashes);
    });
  }

  has_key_local(db_name, key) {
    return this._logs[db_name]._bloom.has(key);
  }

  has_key_value_local(db_name, key) {
    const entry = key + ':' + value;
    return this._logs[db_name]._bloom.has(entry);
  }

  list_open_dbs(callback) {
    return Object.keys(this._remotes);
  }
}

module.exports = Client; 
