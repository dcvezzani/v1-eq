import { exec } from 'child_process';
import fs from 'fs';
import moment from 'moment';
const V1_DIR_TEXT_CACHE = "/Users/davidvezzani/clients/v1-eq/be/data/v1-dir-text-cache.txt";

export const sendShellCommand = (cmd64, callback) => {
  const cmd = new Buffer(cmd64, 'base64').toString("ascii");

  exec(cmd, {maxBuffer : 500 * 1024}, (err, stdout, stderr) => {
    const stream = fs.createWriteStream(V1_DIR_TEXT_CACHE, {flags:'a'});
    stream.write(stdout);
    stream.end();

    if(err) {
      console.error(err);
      console.log("cmd", cmd);
      return callback(Error(`Unable to send text`), {cmd, err, stdout, stderr});
    }

    callback(null, {cmd, stdout, stderr});
  });
};

