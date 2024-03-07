import { existsSync } from "fs";
import * as fs from "fs/promises";
import { homedir } from "os";
import path from "path";
import { lock } from "cross-process-lock";
import { v4 as uuidv4 } from "uuid";

let procNum: string = "";

function theDate() {
  return new Date().toISOString();
}

function log(msg: string) {
  console.log(`${theDate()} ${procNum} ${msg}`);
}

async function getClientUuid(): Promise<string> {
  const baseDir = path.join(homedir(), ".lock-test");
  if (!existsSync(baseDir)) {
    await fs.mkdir(baseDir);
  }
  const file = path.join(baseDir, "client-uuid");
  const lockfile = `${file}.lock`;
  if (!existsSync(lockfile)) {
    await fs.writeFile(lockfile, "", "utf8");
  }
  const waitLockStart = Date.now();
  log(`waiting for lock`);
  const unlock = await lock(lockfile, { lockTimeout: 5000, waitTimeout: 2000 });
  const lockStartTime = Date.now();
  const waitLockTime = lockStartTime - waitLockStart;
  log(`lock acquired - wait time: ${waitLockTime}ms`);
  try {
    if (existsSync(file)) {
      const contents = await fs.readFile(file, "utf8");
      // make sure it is a valid v4 uuid using regex
      if (
        contents.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        )
      ) {
        return contents;
      } else {
        log(`invalid contents ${contents}`);
      }
    } else {
		log(`file does not exist`);
	}
    // if not, new uuid
    const uuid = uuidv4();

    await fs.writeFile(file, uuid, "utf8");
    return uuid;
  } catch (error) {
    console.error(`${theDate()} ${procNum} error`, error);
    throw error;
  } finally {
    await unlock();
    const lockEndTime = Date.now();
    const lockTime = lockEndTime - lockStartTime;
    log(`lock released - lock held for ${lockTime}ms`);
  }
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
