import type { IFs } from 'memfs'
import type { QuickJSAsyncContext, QuickJSContext, Scope } from 'quickjs-emscripten-core'
import type { RuntimeOptions } from '../../types/RuntimeOptions.js'
import { expose } from '../expose/expose.js'

export const provideFs = (
	ctx: QuickJSContext | QuickJSAsyncContext,
	scope: Scope,
	runtimeOptions: RuntimeOptions,
	fs: IFs,
) => {
	const disabledFn = <P extends unknown[], R>(..._params: P): R => {
		throw new Error('File access is disabled')
	}

	const enabledFileSystem = {
		access: (...params: Parameters<typeof fs.access>) => fs.access(...params),
		accessSync: (...params: Parameters<typeof fs.accessSync>) => fs.accessSync(...params),
		appendFile: (...params: Parameters<typeof fs.appendFile>) => fs.appendFile(...params),
		appendFileSync: (...params: Parameters<typeof fs.appendFileSync>) => fs.appendFileSync(...params),
		chmod: (...params: Parameters<typeof fs.chmod>) => fs.chmod(...params),
		chmodSync: (...params: Parameters<typeof fs.chmodSync>) => fs.chmodSync(...params),
		chown: (...params: Parameters<typeof fs.chown>) => fs.chown(...params),
		chownSync: (...params: Parameters<typeof fs.chownSync>) => fs.chownSync(...params),
		close: (...params: Parameters<typeof fs.close>) => fs.close(...params),
		closeSync: (...params: Parameters<typeof fs.closeSync>) => fs.closeSync(...params),
		copyFile: (...params: Parameters<typeof fs.copyFile>) => fs.copyFile(...params),
		copyFileSync: (...params: Parameters<typeof fs.copyFileSync>) => fs.copyFileSync(...params),
		createReadStream: (...params: Parameters<typeof fs.createReadStream>) => fs.createReadStream(...params),
		createWriteStream: (...params: Parameters<typeof fs.createWriteStream>) => fs.createWriteStream(...params),
		exists: (...params: Parameters<typeof fs.exists>) => fs.exists(...params),
		existsSync: (...params: Parameters<typeof fs.existsSync>) => fs.existsSync(...params),
		fchmod: (...params: Parameters<typeof fs.fchmod>) => fs.fchmod(...params),
		fchmodSync: (...params: Parameters<typeof fs.fchmodSync>) => fs.fchmodSync(...params),
		fchown: (...params: Parameters<typeof fs.fchown>) => fs.fchown(...params),
		fchownSync: (...params: Parameters<typeof fs.fchownSync>) => fs.fchownSync(...params),
		fdatasync: (...params: Parameters<typeof fs.fdatasync>) => fs.fdatasync(...params),
		fdatasyncSync: (...params: Parameters<typeof fs.fdatasyncSync>) => fs.fdatasyncSync(...params),
		fstat: (...params: Parameters<typeof fs.fstat>) => fs.fstat(...params),
		fstatSync: (...params: Parameters<typeof fs.fstatSync>) => fs.fstatSync(...params),
		fsync: (...params: Parameters<typeof fs.fsync>) => fs.fsync(...params),
		fsyncSync: (...params: Parameters<typeof fs.fsyncSync>) => fs.fsyncSync(...params),
		ftruncate: (...params: Parameters<typeof fs.ftruncate>) => fs.ftruncate(...params),
		ftruncateSync: (...params: Parameters<typeof fs.ftruncateSync>) => fs.ftruncateSync(...params),
		futimes: (...params: Parameters<typeof fs.futimes>) => fs.futimes(...params),
		futimesSync: (...params: Parameters<typeof fs.futimesSync>) => fs.futimesSync(...params),
		lchmod: (...params: Parameters<typeof fs.lchmod>) => fs.lchmod(...params),
		lchmodSync: (...params: Parameters<typeof fs.lchmodSync>) => fs.lchmodSync(...params),
		lchown: (...params: Parameters<typeof fs.lchown>) => fs.lchown(...params),
		lchownSync: (...params: Parameters<typeof fs.lchownSync>) => fs.lchownSync(...params),
		link: (...params: Parameters<typeof fs.link>) => fs.link(...params),
		linkSync: (...params: Parameters<typeof fs.linkSync>) => fs.linkSync(...params),
		lstat: (...params: Parameters<typeof fs.lstat>) => fs.lstat(...params),
		lstatSync: (...params: Parameters<typeof fs.lstatSync>) => fs.lstatSync(...params),
		mkdir: (...params: Parameters<typeof fs.mkdir>) => fs.mkdir(...params),
		mkdirSync: (...params: Parameters<typeof fs.mkdirSync>) => fs.mkdirSync(...params),
		mkdtemp: (...params: Parameters<typeof fs.mkdtemp>) => fs.mkdtemp(...params),
		mkdtempSync: (...params: Parameters<typeof fs.mkdtempSync>) => fs.mkdtempSync(...params),
		open: (...params: Parameters<typeof fs.open>) => fs.open(...params),
		openSync: (...params: Parameters<typeof fs.openSync>) => fs.openSync(...params),
		readdir: (...params: Parameters<typeof fs.readdir>) => fs.readdir(...params),
		readdirSync: (...params: Parameters<typeof fs.readdirSync>) => fs.readdirSync(...params),
		read: (...params: Parameters<typeof fs.read>) => fs.read(...params),
		readSync: (...params: Parameters<typeof fs.readSync>) => fs.readSync(...params),
		readFile: (...params: Parameters<typeof fs.readFile>) => fs.readFile(...params),
		readFileSync: (...params: Parameters<typeof fs.readFileSync>) => fs.readFileSync(...params).toString(),
		readlink: (...params: Parameters<typeof fs.readlink>) => fs.readlink(...params),
		readlinkSync: (...params: Parameters<typeof fs.readlinkSync>) => fs.readlinkSync(...params),
		realpath: (...params: Parameters<typeof fs.realpath>) => fs.realpath(...params),
		realpathSync: (...params: Parameters<typeof fs.realpathSync>) => fs.realpathSync(...params),
		rename: (...params: Parameters<typeof fs.rename>) => fs.rename(...params),
		renameSync: (...params: Parameters<typeof fs.renameSync>) => fs.renameSync(...params),
		rmdir: (...params: Parameters<typeof fs.rmdir>) => fs.rmdir(...params),
		rmdirSync: (...params: Parameters<typeof fs.rmdirSync>) => fs.rmdirSync(...params),
		stat: (...params: Parameters<typeof fs.stat>) => fs.stat(...params),
		statSync: (...params: Parameters<typeof fs.statSync>) => fs.statSync(...params),
		symlink: (...params: Parameters<typeof fs.symlink>) => fs.symlink(...params),
		symlinkSync: (...params: Parameters<typeof fs.symlinkSync>) => fs.symlinkSync(...params),
		truncate: (...params: Parameters<typeof fs.truncate>) => fs.truncate(...params),
		truncateSync: (...params: Parameters<typeof fs.truncateSync>) => fs.truncateSync(...params),
		unlink: (...params: Parameters<typeof fs.unlink>) => fs.unlink(...params),
		unlinkSync: (...params: Parameters<typeof fs.unlinkSync>) => fs.unlinkSync(...params),
		utimes: (...params: Parameters<typeof fs.utimes>) => fs.utimes(...params),
		utimesSync: (...params: Parameters<typeof fs.utimesSync>) => fs.utimesSync(...params),
		write: (...params: Parameters<typeof fs.write>) => fs.write(...params),
		writeSync: (...params: Parameters<typeof fs.writeSync>) => fs.writeSync(...params),
		writeFile: (...params: Parameters<typeof fs.writeFile>) => fs.writeFile(...params),
		writeFileSync: (...params: Parameters<typeof fs.writeFileSync>) => {
			fs.writeFileSync(...params)
		},
	} as const

	const disabledFileSystem: typeof enabledFileSystem = {
		access: disabledFn,
		accessSync: disabledFn,
		appendFile: disabledFn,
		appendFileSync: disabledFn,
		chmod: disabledFn,
		chmodSync: disabledFn,
		chown: disabledFn,
		chownSync: disabledFn,
		close: disabledFn,
		closeSync: disabledFn,
		copyFile: disabledFn,
		copyFileSync: disabledFn,
		createReadStream: disabledFn,
		createWriteStream: disabledFn,
		exists: disabledFn,
		existsSync: disabledFn,
		fchmod: disabledFn,
		fchmodSync: disabledFn,
		fchown: disabledFn,
		fchownSync: disabledFn,
		fdatasync: disabledFn,
		fdatasyncSync: disabledFn,
		fstat: disabledFn,
		fstatSync: disabledFn,
		fsync: disabledFn,
		fsyncSync: disabledFn,
		ftruncate: disabledFn,
		ftruncateSync: disabledFn,
		futimes: disabledFn,
		futimesSync: disabledFn,
		lchmod: disabledFn,
		lchmodSync: disabledFn,
		lchown: disabledFn,
		lchownSync: disabledFn,
		link: disabledFn,
		linkSync: disabledFn,
		lstat: disabledFn,
		lstatSync: disabledFn,
		mkdir: disabledFn,
		mkdirSync: disabledFn,
		mkdtemp: disabledFn,
		mkdtempSync: disabledFn,
		open: disabledFn,
		openSync: disabledFn,
		readdir: disabledFn,
		readdirSync: disabledFn,
		read: disabledFn,
		readSync: disabledFn,
		readFile: disabledFn,
		readFileSync: disabledFn,
		readlink: disabledFn,
		readlinkSync: disabledFn,
		realpath: disabledFn,
		realpathSync: disabledFn,
		rename: disabledFn,
		renameSync: disabledFn,
		rmdir: disabledFn,
		rmdirSync: disabledFn,
		stat: disabledFn,
		statSync: disabledFn,
		symlink: disabledFn,
		symlinkSync: disabledFn,
		truncate: disabledFn,
		truncateSync: disabledFn,
		unlink: disabledFn,
		unlinkSync: disabledFn,
		utimes: disabledFn,
		utimesSync: disabledFn,
		write: disabledFn,
		writeSync: disabledFn,
		writeFile: disabledFn,
		writeFileSync: disabledFn,
	}

	expose(ctx, scope, {
		__fs: runtimeOptions.allowFs ? enabledFileSystem : disabledFileSystem,
	})
}
