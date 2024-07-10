export default `

function unimplemented(name) {
	throw new Error('Node.js process ' + name + ' is not supported')
}

var title = 'quickjs-emscripten'
var arch = 'wasm'
var platform = 'wasi'
var env = globalThis.env
var argv = globalThis.argv || globalThis.args
var execArgv = []
var version = 'v16.8.0'
var versions = {}

var emitWarning = (message, type) => {
	console.warn((type ? type + ': ' : '') + message)
}

var binding = name => {
	unimplemented('binding')
}

var umask = mask => 0

var cwd = () => './'
var chdir = dir => {
	unimplemented('chdir')
}

var release = {
	name: 'quickjs-emscripten',
	sourceUrl: '',
	headersUrl: '',
	libUrl: '',
}

function noop() {}

var _rawDebug = noop
var moduleLoadList = []
function _linkedBinding(name) {
	unimplemented('_linkedBinding')
}
var domain = {}
var _exiting = false
var config = {}
function dlopen(name) {
	unimplemented('dlopen')
}
function _getActiveRequests() {
	return []
}
function _getActiveHandles() {
	return []
}
var reallyExit = noop
var _kill = noop
var cpuUsage = () => ({})
var resourceUsage = cpuUsage
var memoryUsage = cpuUsage
var kill = noop
var exit = globalThis.exit
var openStdin = noop
var allowedNodeEnvironmentFlags = {}
function assert(condition, message) {
	if (!condition) {
		throw new Error(message || 'assertion error')
	}
}
var features = {
	inspector: false,
	debug: false,
	uv: false,
	ipv6: false,
	tls_alpn: false,
	tls_sni: false,
	tls_ocsp: false,
	tls: false,
	cached_builtins: true,
}
var _fatalExceptions = noop
var setUncaughtExceptionCaptureCallback = noop
function hasUncaughtExceptionCaptureCallback() {
	return false
}
var _tickCallback = noop
var _debugProcess = noop
var _debugEnd = noop
var _startProfilerIdleNotifier = noop
var _stopProfilerIdleNotifier = noop
var stdout = undefined
var stderr = undefined
var stdin = undefined
var abort = noop
var pid = 2
var ppid = 1
var execPath = 'wasmedge-quickjs'
var debugPort = 9229
var argv0 = 'wasmedge-quickjs'
var _preload_modules = []
var setSourceMapsEnabled = noop

var _performance = {
	now: undefined,
	timing: undefined,
}
if (_performance.now === undefined) {
	var nowOffset = Date.now()

	if (_performance.timing && _performance.timing.navigationStart) {
		nowOffset = _performance.timing.navigationStart
	}
	_performance.now = () => Date.now() - nowOffset
}

function uptime() {
	return _performance.now() / 1000
}

var nanoPerSec = 1000000000
function hrtime(previousTimestamp) {
	var baseNow = Math.floor((Date.now() - _performance.now()) * 1e-3)
	var clocktime = _performance.now() * 1e-3
	var seconds = Math.floor(clocktime) + baseNow
	var nanoseconds = Math.floor((clocktime % 1) * 1e9)
	if (previousTimestamp) {
		seconds = seconds - previousTimestamp[0]
		nanoseconds = nanoseconds - previousTimestamp[1]
		if (nanoseconds < 0) {
			seconds--
			nanoseconds += nanoPerSec
		}
	}
	return [seconds, nanoseconds]
}

hrtime.bigint = time => {
	var diff = hrtime(time)
	if (typeof BigInt === 'undefined') {
		return diff[0] * nanoPerSec + diff[1]
	}
	return BigInt(diff[0] * nanoPerSec) + BigInt(diff[1])
}

var _maxListeners = 10
var _events = {}
var _eventsCount = 0
function on() {
	return process
}
var addListener = on
var once = on
var off = on
var removeListener = on
var removeAllListeners = on
var emit = noop
var prependListener = on
var prependOnceListener = on
function listeners(name) {
	return []
}
var process = {
	version: version,
	versions: versions,
	arch: arch,
	platform: platform,
	release: release,
	_rawDebug: _rawDebug,
	moduleLoadList: moduleLoadList,
	binding: binding,
	_linkedBinding: _linkedBinding,
	_events: _events,
	_eventsCount: _eventsCount,
	_maxListeners: _maxListeners,
	on: on,
	addListener: addListener,
	once: once,
	off: off,
	removeListener: removeListener,
	removeAllListeners: removeAllListeners,
	emit: emit,
	prependListener: prependListener,
	prependOnceListener: prependOnceListener,
	listeners: listeners,
	domain: domain,
	_exiting: _exiting,
	config: config,
	dlopen: dlopen,
	uptime: uptime,
	_getActiveRequests: _getActiveRequests,
	_getActiveHandles: _getActiveHandles,
	reallyExit: reallyExit,
	_kill: _kill,
	cpuUsage: cpuUsage,
	resourceUsage: resourceUsage,
	memoryUsage: memoryUsage,
	kill: kill,
	exit: exit,
	openStdin: openStdin,
	allowedNodeEnvironmentFlags: allowedNodeEnvironmentFlags,
	assert: assert,
	features: features,
	_fatalExceptions: _fatalExceptions,
	setUncaughtExceptionCaptureCallback: setUncaughtExceptionCaptureCallback,
	hasUncaughtExceptionCaptureCallback: hasUncaughtExceptionCaptureCallback,
	emitWarning: emitWarning,
	nextTick: globalThis.nextTick,
	_tickCallback: _tickCallback,
	_debugProcess: _debugProcess,
	_debugEnd: _debugEnd,
	_startProfilerIdleNotifier: _startProfilerIdleNotifier,
	_stopProfilerIdleNotifier: _stopProfilerIdleNotifier,
	stdout: stdout,
	stdin: stdin,
	stderr: stderr,
	abort: abort,
	umask: umask,
	chdir: chdir,
	cwd: cwd,
	env: env,
	title: title,
	argv: argv,
	execArgv: execArgv,
	pid: pid,
	ppid: ppid,
	execPath: execPath,
	debugPort: debugPort,
	hrtime: hrtime,
	argv0: argv0,
	_preload_modules: _preload_modules,
	setSourceMapsEnabled: setSourceMapsEnabled,
}

const nextTick = globalThis.nextTick

export {
	_debugEnd,
	_debugProcess,
	_events,
	_eventsCount,
	_exiting,
	_fatalExceptions,
	_getActiveHandles,
	_getActiveRequests,
	_kill,
	_linkedBinding,
	_maxListeners,
	_preload_modules,
	_rawDebug,
	_startProfilerIdleNotifier,
	_stopProfilerIdleNotifier,
	_tickCallback,
	abort,
	addListener,
	allowedNodeEnvironmentFlags,
	arch,
	argv,
	argv0,
	assert,
	binding,
	chdir,
	config,
	cpuUsage,
	cwd,
	debugPort,
	process as default,
	dlopen,
	domain,
	emit,
	emitWarning,
	env,
	execArgv,
	execPath,
	exit,
	features,
	hasUncaughtExceptionCaptureCallback,
	hrtime,
	kill,
	listeners,
	memoryUsage,
	moduleLoadList,
	nextTick,
	off,
	on,
	once,
	openStdin,
	pid,
	platform,
	ppid,
	prependListener,
	prependOnceListener,
	reallyExit,
	release,
	removeAllListeners,
	removeListener,
	resourceUsage,
	setSourceMapsEnabled,
	setUncaughtExceptionCaptureCallback,
	stderr,
	stdin,
	stdout,
	title,
	umask,
	uptime,
	version,
	versions,
}
`
