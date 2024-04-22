const spawn = require('child_process').execFile;
const os = require('node:os');

exports.run = (command) => {
  const string = command.trim().split(' ').slice(1).join(' ');

  const child = spawn('cmd', ['/c', 'start cmd /k', string], {
    detached: true,
    stdio: 'ignore',
    cwd: os.homedir(),
  });

  child.unref();
};
