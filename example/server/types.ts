import type { ErrorResponse } from '../../src/types/ErrorResponse.js'
import type { OkResponse } from '../../src/types/OkResponse.js'

export interface InputData {
	id: string
	content: string
}

export interface ResponseData {
	id: string
	result: OkResponse | ErrorResponse
}
