import ms, { type StringValue } from 'ms'

export const createDebounce = <const F extends (...args: any[]) => any>(period: number, f: F) => {
	let timer: ReturnType<typeof setTimeout>

	return (...args: Parameters<F>) => {
		clearTimeout(timer)
		timer = setTimeout(() => f(...args), period)
	}
}

export const safeMs = (value: string | undefined | null, defaultValue: StringValue): number => {
	if (value) {
		try {
			return ms(value as any)
		} catch (e) {
			console.warn(e)
		}
	}

	return ms(defaultValue)
}
