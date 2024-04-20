export const createDebounce = <const F extends (...args: any[]) => any>(period: number, f: F) => {
	let timer: ReturnType<typeof setTimeout>

	return (...args: Parameters<F>) => {
		clearTimeout(timer)
		timer = setTimeout(() => f(...args), period)
	}
}
