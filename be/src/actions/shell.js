import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import moment from 'moment';
// const DEFAULT_OUTPUT_CACHE_PATH = "/Users/davidvezzani/projects/v1-eq/be/data/default-output.txt";

const shellCommand = (cmd64, cachedOutputPath, callback) => {
  console.log(`Refreshing cache: ${cachedOutputPath}`);
  
  const cmd = new Buffer(cmd64, 'base64').toString("ascii");

  console.log(">>>cmd", cmd);
  // try {
    exec(cmd, {maxBuffer : 500 * 1024}, (err, stdout, stderr) => {
      if(err) {
        console.error(err);
        return callback(Error(`Unable to execute shell command`), {cmd, err, stdout, stderr});
      }

      const cachedOutputDirname = path.dirname(cachedOutputPath);

      try {
        const stream = fs.createWriteStream(cachedOutputPath, {flags:'w'}); // {flags:'a'}
        stream.write(stdout);
        stream.end();
      } catch(err) { 
        console.error("Unable to cache results (not the end of the world)"); 
      }

      callback(null, {cmd, stdout, stderr});
    });
      
  // } catch(err2) {
  //   console.log(">>> err2", JSON.stringify(err2));
  //   if (!err2 || Object.keys(err2).length === 0) err2 = Error("Unable to run shell command");
  //   callback(err2, {cmd, err: err2});
  // }
};

export const sendShellCommand = (data, callback) => {
  const cmd64 = data.cmd;
  const cachedOutputPath = data.cachePath;
  const refresh = data.refresh;

  fs.access(cachedOutputPath, (err) => {
    // console.log(">>> refresh, err", refresh, err);
    if (refresh || err) {
      return shellCommand(cmd64, cachedOutputPath, callback);
    }

    fs.readFile(cachedOutputPath, (err, data) => {
      if (err) {
        return callback(Error(`Unable to read cached data from file`), {cmd, err});
      }

      callback(null, {cmd: null, err, stdout: data.toString()});
    });
  });
};

