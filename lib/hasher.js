const crypto = require('crypto');

class Hasher {

  constructor(options) {
    options = options || {};
    this._hashes = options.starting_hashes || [];
    this._salts = options.salts || [];
    this._last_timestamp = options.last_timestamp || 0;
    if (this._salts.length == 0) {
      this._gen_salts(20);
    }
  }

  _gen_salts(number) {
    for (var i = 0; i < number; i++) {
      this._salts.push(crypto.randomBytes(16).toString('hex'));
    }
  }

  _hash_key_value(key, value) {
    return this._salts.map(function(salt) {
      return crypto.createHash('sha256')
        .update(key, 'utf8')
        .update(value, 'utf8')
        .update(salt, 'utf8')
        .digest()
    });
  }

  _xor_strings(a, b) {
    if (a && !b) {
      return a;
    } else if (!a && b) {
      return b;
    } else {
      // Do xor
    }
  }

  update(timestamp, key, value) {
    const key_value_hashes = this._hash_key_value(key, value);
    this._hashes = this._hashes.map(function(existing_hash, index) {
      const key_value_hash = key_values_hashes[index];
      return this._xor_strings(existing_hash, key_value_hash);
    });
    this._last_timestamp = timestamp;
  }

  get_n_salts(n) {
    if (n > this._salts.length) {
      return this._salts;
    } else {
      var salts = [];
      var salts_length = this._salts.length;
      while (salts.length < n) {
        var index = Math.floor(Math.random() * salts_length);
        var salt = this._salts[index];
        if (salts.indexOf(salt) == -1) {
          salts.push(salt);
        }
      }
      return salts;
    }
  }

  serialize() {
    return JSON.stringify({
      starting_hashes: this._hashes,
      salts: this._salts,
      last_timestamp: this._last_timestamp
    });
  }

}

module.exports = Hasher;
