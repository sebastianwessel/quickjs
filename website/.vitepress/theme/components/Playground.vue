<template>
  <textarea id="code" style="height: 400px; width: 100%">
import { readFileSync, writeFileSync } from 'node:fs'
console.info('Starting...')
const fn = async (value) => {
  console.debug(value)
  writeFileSync('./text.txt', value)
  return readFileSync('./text.txt')
}

console.warn('Might be cool!')

const getExample = async () => {
    const response = await fetch('https://sebastianwessel.github.io/quickjs/example-request.html')
    if (!response.ok) {
      console.error('Request failed: ' + response.status + ' ' + response.statusText)
      return 
    }
    const body = await response.text()
    console.log('Response body: ' + body)
    return body
}

await getExample()

console.warn('top-level await is nice')

export default await fn('Hello World')
  </textarea>

  <button id="runButton" class="button-modern">Run Code</button>
  <h2>Result</h2>
  <pre id="output" class="font-semibold"></pre>
  <h2>Console Output</h2>
  <div id="consoleOutput">
    <pre id="console"></pre>
  </div>
  <div id="gist"></div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(async () => {
	if (typeof window === 'undefined') return // Ensures code only runs in the browser

	// Function to dynamically load styles
	const loadStyle = href => {
		return new Promise((resolve, reject) => {
			if (document.querySelector(`link[href="${href}"]`)) return resolve() // Avoid duplicates
			const link = document.createElement('link')
			link.rel = 'stylesheet'
			link.href = href
			link.onload = resolve
			link.onerror = reject
			document.head.appendChild(link)
		})
	}
	// Load CodeMirror CSS first
	await loadStyle('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/codemirror.min.css')

	// Function to dynamically load scripts
	const loadScript = src => {
		return new Promise((resolve, reject) => {
			const script = document.createElement('script')
			script.src = src
			script.async = true
			script.onload = resolve
			script.onerror = reject
			document.head.appendChild(script)
		})
	}

	// Load CodeMirror
	await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/codemirror.min.js')
	await loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/mode/javascript/javascript.min.js')

	// Initialize CodeMirror
	const editor = CodeMirror.fromTextArea(document.getElementById('code'), {
		mode: { name: 'javascript', typescript: true },
		lineNumbers: true,
	})

	editor.setSize(null, '400px')

	function logMessage(type, message) {
		const outputElement = document.getElementById('console')
		const logMessage = document.createElement('div')
		logMessage.className = type
		logMessage.textContent = message
		outputElement.appendChild(logMessage)
	}

	// Load QuickJS
	const { loadQuickJs } = await import('https://esm.sh/@sebastianwessel/quickjs@latest')
	const { runSandboxed } = await loadQuickJs('https://esm.sh/@jitl/quickjs-wasmfile-release-sync')

	const fetchAdapter = async (url, param) => {
		const res = await fetch(url, { ...param })
		return {
			status: res.status,
			ok: res.ok,
			statusText: res.statusText,
			json: async () => await res.json(),
			text: async () => await res.text(),
			formData: () => res.formData(),
			headers: res.headers,
			type: res.type,
			url: res.url,
			blob: async () => await res.blob(),
			bodyUsed: res.bodyUsed,
			redirected: res.redirected,
			body: res.body,
			arrayBuffer: async () => await res.arrayBuffer(),
			clone: () => res.clone(),
		}
	}

	// Add event listener for running code
	document.getElementById('runButton').addEventListener('click', async () => {
		const code = editor.getValue()
		const outputElement = document.getElementById('output')
		const consoleElement = document.getElementById('console')
		outputElement.innerHTML = ''
		consoleElement.innerHTML = ''

		const options = {
			allowFetch: true,
			allowFs: true,
			fetchAdapter,
			env: {
				MY_ENV_VAR: 'env var value',
			},
			console: {
				log: message => logMessage('log text-gray-400', message),
				info: message => logMessage('info text-blue-500', message),
				warn: message => logMessage('warn text-yellow-500', message),
				error: message => logMessage('error text-red-500', message),
			},
		}

		try {
			const res = await runSandboxed(async ({ evalCode }) => {
				return evalCode(code)
			}, options)

			outputElement.innerHTML = JSON.stringify(res, null, 2).replaceAll('\\n', '<br>')
		} catch (e) {
			console.error(e)
			logMessage('error text-red-500', JSON.stringify(e).replaceAll('\\n', '<br>'))
		}
	})
})
</script>

<style>
.button-modern {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #4A90E2, #007AFF);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 4px 10px rgba(0, 122, 255, 0.2);
  margin-top: 20px;
  margin-bottom: 20px;
}

.button-modern:hover {
  background: linear-gradient(135deg, #007AFF, #4A90E2);
  box-shadow: 0 6px 15px rgba(0, 122, 255, 0.3);
}

.button-modern:active {
  transform: scale(0.98);
}

.button-modern:focus {
  outline: 2px sol
}
</style>