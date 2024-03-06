import { existsSync } from "fs";
import * as fs from "fs/promises";
import { homedir } from "os";
import path from "path";
import { lock } from "proper-lockfile";
import { v4 as uuidv4 } from 'uuid';

// function that returns ISO date / time

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
	// create file if it doesn't exist
	if (!existsSync(file)) {
		await fs.writeFile(file, "", "utf8");
	}
	if (!existsSync(lockfile)) {
		await fs.writeFile(lockfile, "", "utf8");
	}
	const waitLockStart = Date.now();
	log(`waiting for lock`);
	const release = await lock(lockfile, { retries: 3, update: 1000 });
	const lockStartTime = Date.now();
	const waitLockTime = lockStartTime - waitLockStart;
	log(`lock acquired - wait time: ${waitLockTime}ms`);
	try {
		const contents = await fs.readFile(file, "utf8");
		// make sure it is a valid v4 uuid using regex
		if (contents.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
			return contents;
		}
		// if not, new uuid
		const uuid = uuidv4();

		await fs.writeFile(file, uuid, "utf8");
		return uuid;
	} catch (error) {
		console.error(`${theDate()} ${pid} error`, error);
		throw error;
	} finally {
		await release();
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
