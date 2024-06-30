export type RuntimeOptions = {
	mountPath?: string
	allowFileWrite?: boolean
	allowHttp?: boolean
	console?: {
		log: (message?: unknown, ...optionalParams: unknown[]) => void
		error: (message?: unknown, ...optionalParams: unknown[]) => void
		warn: (message?: unknown, ...optionalParams: unknown[]) => void
	}
	env?: Record<string, unknown>
}
