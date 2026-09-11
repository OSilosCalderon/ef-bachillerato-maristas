import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const dir = path.join(process.cwd(), '.vercel-bootstrap');
const files = fs.readdirSync(dir).filter((name) => /^chunk-\d+\.txt$/.test(name)).sort();
if (!files.length) throw new Error('No bootstrap chunks found');
const b64 = files.map((name) => fs.readFileSync(path.join(dir, name), 'utf8').trim()).join('');
const archive = Buffer.from(b64, 'base64');
const sha = crypto.createHash('sha256').update(archive).digest('hex');
const expected = 'abdee552bc1a57935dfc2b0bef0b268d0682b56591bb886e805c57de123523ba';
if (sha !== expected) throw new Error(`Bootstrap checksum mismatch: ${sha}`);
const archivePath = path.join('/tmp', 'ef-bachillerato.tar.gz');
fs.writeFileSync(archivePath, archive);
const out = spawnSync('tar', ['-xzf', archivePath, '-C', process.cwd()], { stdio: 'inherit' });
if (out.status !== 0) process.exit(out.status ?? 1);
console.log(`Bootstrap restored ${archive.length} bytes successfully.`);
