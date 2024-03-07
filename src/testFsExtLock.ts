import { existsSync, mkdirSync, openSync, readSync, writeSync } from "fs";
import { flock } from "fs-ext";
import { homedir } from "os";
import path from "path";
import { v4 as uuidv4 } from "uuid";

let procNum: string = "";

function theDate() {
  return new Date().toISOString();
}

function log(msg: string) {
  console.log(`${theDate()} ${procNum} ${msg}`);
}

async function getClientUuid(): Promise<string> {
  return new Promise((resolve, reject) => {
    const baseDir = path.join(homedir(), ".lock-test");
    if (!existsSync(baseDir)) {
      mkdirSync(baseDir);
    }
    const file = path.join(baseDir, "client-uuid");
    const fd = openSync(file, "a+");
    const waitLockStart = Date.now();
    log(`waiting for lock`);
    flock(fd, "ex", (err) => {
      if (err) {
        throw err;
      }
      const lockStartTime = Date.now();
      const waitLockTime = lockStartTime - waitLockStart;
      log(`lock acquired - wait time: ${waitLockTime}ms`);
      try {
        const buffer = Buffer.alloc(36);
        readSync(fd, buffer, 0, 36, 0);
        const contents = buffer.toString("utf8");
        // make sure it is a valid v4 uuid using regex
        if (
          contents.match(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          )
        ) {
          flock(fd, "un", (err) => {
            if (err) {
              throw err;
            }
            const lockEndTime = Date.now();
            const lockTime = lockEndTime - lockStartTime;
            log(`lock released - lock held for ${lockTime}ms`);
            resolve(contents);
            return;
          });
          return;
        } else {
          log(`invalid contents`);
        }

        // if not, new uuid
        log(`writing new uuid`);
        const uuid = uuidv4();

        writeSync(fd, uuid, 0, "utf8");
        flock(fd, "un", (err) => {
          if (err) {
            throw err;
          }
          const lockEndTime = Date.now();
          const lockTime = lockEndTime - lockStartTime;
          log(`lock released - lock held for ${lockTime}ms`);
          resolve(uuid);
        });
        return uuid;
      } catch (error) {
        console.error(`${theDate()} ${procNum} error`, error);
        throw error;
      }
    });
  });
}

(async () => {
  try {
    log(`started`);
    procNum = process.argv[2];
    const start = Date.now();
    const uuid = await getClientUuid();
    const end = Date.now();
    log(`clientUuid: ${uuid} total time: ${end - start}ms`);
    process.exit(0);
  } catch (error) {
    console.error(`error`, error);
    process.exit(1);
  }
})();
