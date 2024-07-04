import { getQuickJS } from 'quickjs-emscripten'

const QuickJS = await getQuickJS()

const vm = QuickJS.newContext()

setInterval(() => vm.runtime.executePendingJobs(), 1)

// Evaluate code that uses `readFile`, which returns a promise
const result = vm.evalCode(`(async () => {

  const x = ()=> new Promise( (resolve, reject) => {
    resolve('resolve')
  })

  const y = ()=>'hello'

  const content = await y()
  return content.toUpperCase()
})()`)
const promiseHandle = vm.unwrapResult(result)

const resolvedResult = await vm.resolvePromise(promiseHandle)
promiseHandle.dispose()
const resolvedHandle = vm.unwrapResult(resolvedResult)
console.log('Result:', vm.getString(resolvedHandle))
resolvedHandle.dispose()
