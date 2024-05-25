export class Timing {
	constructor(public readonly maxIterations: number) {
		this.start = new Date().getTime()
	}

	setStart(time?: number) {
		this.start = time || new Date().getTime()
	}

	update(iteration: number, print = true) {
		this.iteration = iteration
		this.elapsed = new Date().getTime() - this.start

		if (iteration === 0) return

		const eta = new Date(
			new Date().getTime() +
				(this.elapsed / this.iteration) * (this.maxIterations - this.iteration),
		)

		const currentIteration = (this.iteration + 1)
			.toString()
			.padStart(this.maxIterations.toString().length, ' ')

		if (print) {
			console.log(
				`💡 (${currentIteration}/${this.maxIterations}) | ` +
					`Elapsed: ${this.formatElapsed()} | ` +
					`ETA: ${eta.toISOString()}`,
			)
		}
	}

	finish() {
		this.update(this.maxIterations - 1, false)
		console.log(`💪 Finished ${this.maxIterations} iterations in ${this.formatElapsed()}`)
	}

	formatElapsed(): string {
		const hours = Math.floor(this.elapsed / 1000 / 60 / 60)
		const minutes = Math.floor((this.elapsed / 1000 / 60) % 60)
		const seconds = Math.floor((this.elapsed / 1000) % 60)

		return (
			`${hours.toString().padStart(2, '0')}:` +
			`${minutes.toString().padStart(2, '0')}:` +
			`${seconds.toString().padStart(2, '0')}`
		)
	}

	private start: number
	private iteration: number = 0
	private elapsed: number = 0
}
