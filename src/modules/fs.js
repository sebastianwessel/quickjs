export default `
import { resolve } from 'node:path'

export const access = (...params) =>  __fs.access(...params)
export const accessSync = (...params) =>  __fs.accessSync(...params)
export const appendFile = (...params) =>  __fs.appendFile(...params)
export const appendFileSync = (...params) =>  __fs.appendFileSync(...params)
export const chmod = (...params) =>  __fs.chmod(...params)
export const chmodSync = (...params) =>  __fs.chmodSync(...params)

export const readFileSync = (file, ...params) =>  __fs.readFileSync(resolve(file), ...params)

export const writeFileSync = (file, ...params) => __fs.writeFileSync(resolve(file), ...params)

export const existsSync = (...params) => __fs.existsSync(...params)

`
