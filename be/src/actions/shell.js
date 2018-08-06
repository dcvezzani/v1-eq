import { exec } from 'child_process';
import fs from 'fs';
import moment from 'moment';
const DEFAULT_OUTPUT_CACHE_PATH = "/Users/davidvezzani/clients/v1-eq/be/data/default-output.txt";

export const sendShellCommand = (cmd64, cachedOutputPath, callback) => {
  const cmd = new Buffer(cmd64, 'base64').toString("ascii");

  exec(cmd, {maxBuffer : 500 * 1024}, (err, stdout, stderr) => {

    fs.access('myfile', (err) => {
      let writeStreamPath = cachedOutputPath;
      if (err) {
        console.log(`Invalid value for cachedOutputPath provided: ${cachedOutputPath}.  Using default cache location instead: ${DEFAULT_OUTPUT_CACHE_PATH}`);
        writeStreamPath = DEFAULT_OUTPUT_CACHE_PATH;
      }

      const stream = fs.createWriteStream(writeStreamPath, {flags:'a'});
      stream.write(`\n\n${moment().toDate()}\n`);
      stream.write(stdout);
      stream.end();
    });
    

    if(err) {
      console.error(err);
      console.log("cmd", cmd);
      return callback(Error(`Unable to execute shell command`), {cmd, err, stdout, stderr});
    }

    callback(null, {cmd, stdout, stderr});
  });
};

