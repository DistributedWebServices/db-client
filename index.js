#!/usr/bin/env node

const readline = require('readline');

const program = require('commander')
  .version('0.1.0');

const Client = require('./lib/client');

program
  .command('connect', { isDefault: true })
  .action(function(options) {
    const client = new Client(options);
    open_repl(client)
  });

function open_repl(client) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function repl_loop() {
    rl.question('> ', (input) => {
      const command_parts = input.match(/\w+|"[^"]+"/g);
      const command = command_parts[0]
      const args = command_parts.slice(1)
      if (client[command]) {
        args.push(function() {
          const output = Array.prototype.slice.call(arguments);
          if (output[0]) {
            console.log(output[0].stack || output[0]);
          } else {
            console.log(output.slice(1));
          }
          repl_loop();
        });
        try {
          client[command].apply(client, args);
        } catch(e) {
          console.log(e);
          repl_loop();
        }
      } else {
        console.log("Unknown command "+command);
        repl_loop();
      }
    });
  }
  repl_loop();
}

program.parse(process.argv);
