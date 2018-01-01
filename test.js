const Client = require('./lib/client');

const c = new Client();
c.connect(function() {
  c.del('test', 'test', function(err, value) {
    c.get('test', 'test', function(err, value) {
      console.log("FIRST GET", value);
      c.put('test', 'test', { 'testing': '1234' }, function(err) {
        c.get('test', 'test', function(err, value) {
          console.log("SECOND GET", value.testing);
          c.del('test', 'test', function(err, value) {
            c.get('test', 'test', function(err, value) {
              console.log("LAST GET", value);
              process.exit();
            });
          });
        });
      });
    });
  });
});
