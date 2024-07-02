import autocannon from 'autocannon'

autocannon(
	{
		url: 'http://127.0.0.1:3000/execute',
		duration: 60,
		method: 'POST',
		body: `import * as path from 'node:path'
import { writeFileSync, readFileSync } from 'node:fs'

const fn = async ()=>{
  // console.log(path.join('src','dist'))

  const url = new URL('https://example.com')

  const f = await fetch(url)

  const text = await f.text()

  writeFileSync('/test.html', 'stored: ' + text)
  
  const result = readFileSync('/test.html')
  
  
  return result
  }
  
export default await fn()`,
	},
	(_err, result) => {
		for (const [key, value] of Object.entries(result)) {
			if (Array.isArray(value)) {
				console.table(value)
			} else {
				console.log(key, value)
			}
		}
	},
)
