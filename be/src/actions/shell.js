import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import moment from 'moment';
const DEFAULT_OUTPUT_CACHE_PATH = "/Users/davidvezzani/clients/v1-eq/be/data/default-output.txt";

const shellCommand = (cmd64, cachedOutputPath, callback) => {
  console.log(`Refreshing cache: ${cachedOutputPath}`);
  
  const cmd = new Buffer(cmd64, 'base64').toString("ascii");

  exec(cmd, {maxBuffer : 500 * 1024}, (err, stdout, stderr) => {
    const cachedOutputDirname = path.dirname(cachedOutputPath);
    
    fs.access(cachedOutputDirname, (err) => {
      let writeStreamPath = cachedOutputPath;
      if (err) {
        console.log(`Invalid value for cachedOutputPath provided: ${cachedOutputPath}.  Using default cache location instead: ${DEFAULT_OUTPUT_CACHE_PATH}`);
        writeStreamPath = DEFAULT_OUTPUT_CACHE_PATH;
      }

      const stream = fs.createWriteStream(writeStreamPath, {flags:'w'}); // {flags:'a'}
      // stream.write(`\n\n${moment().toDate()}\n`);
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

export const sendShellCommand = (data, callback) => {
  const cmd64 = data.cmd;
  const cachedOutputPath = data.cachePath;
  const refresh = data.refresh;

  fs.access(cachedOutputPath, (err) => {
    if (refresh || err) return shellCommand(cmd64, cachedOutputPath, callback);

    let jsonContent = fs.readFile(cachedOutputPath, (err, data) => {
      if (err) return callback(Error(`Unable to execute shell command`), {cmd, err});

      callback(null, {cmd: null, err, stdout: data.toString()});
    });
  });
};

