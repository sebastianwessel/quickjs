import type { Serializer } from '../../../types/Serializer.js'
import { serializeArrayBuffer } from './serializeArrayBuffer.js'
import { serializeBuffer } from './serializeBuffer.js'
import { serializeDate } from './serializeDate.js'
import { serializeError } from './serializeError.js'
import { serializeHeaders } from './serializeHeaders.js'
import { serializeMap } from './serializeMap.js'
import { serializeSet } from './serializeSet.js'
import { serializeURLSearchParams } from './serializeURLSearchParams.js'
import { serializeUrl } from './serializeUrl.js'

export const serializer = new Map<string, Serializer>()

/**
 * Add a new Serializer
 */
export const addSerializer = (name: string, fn: Serializer) => serializer.set(name, fn)

/**
 * Get a Serializer by constructor name
 */
export const getSerializer = (name: string) => serializer.get(name)

addSerializer('Buffer', serializeBuffer)
addSerializer('ArrayBuffer', serializeArrayBuffer)
addSerializer('Map', serializeMap)
addSerializer('Set', serializeSet)
addSerializer('Date', serializeDate)
addSerializer('Headers', serializeHeaders)
addSerializer('URL', serializeUrl)
addSerializer('URLSearchParams', serializeURLSearchParams)

// Errors
addSerializer('AssertionError', serializeError)
addSerializer('Error', serializeError)
addSerializer('EvalError', serializeError)
addSerializer('RangeError', serializeError)
addSerializer('ReferenceError', serializeError)
addSerializer('SyntaxError', serializeError)
addSerializer('SystemError', serializeError)
addSerializer('TypeError', serializeError)
addSerializer('URIError', serializeError)
