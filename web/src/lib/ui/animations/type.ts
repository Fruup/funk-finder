import type { Action } from 'svelte/action'

export const type: Action<HTMLElement, { strings: string[]; delay?: number }> = (node, options) => {
	let currentIndex = 0
	let string = options.strings[currentIndex]
	let i = 0
	let interval: ReturnType<typeof setInterval>
	const { delay = 0 } = options

	const next = () => {
		currentIndex = (currentIndex + 1) % options.strings.length
		string = options.strings[currentIndex]
		i = 0
	}

	const clear = () => {
		interval = setInterval(() => {
			if (node.innerText.length > 0) {
				node.innerText = node.innerText.slice(0, -1)
			} else {
				clearInterval(interval)
				next()

				setTimeout(() => {
					start()
				}, 1000)
			}
		}, 60)
	}

	const start = () => {
		node.innerText = ''

		interval = setInterval(() => {
			if (i >= string.length) {
				clearInterval(interval)
				setTimeout(() => {
					clear()
				}, 5000)
				return
			}

			node.innerText += string[i]
			i++
		}, 100)
	}

	setTimeout(() => {
		start()
	}, delay)

	return {
		destroy() {
			clearInterval(interval)
		},
	}
}
