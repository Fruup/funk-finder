import readline from 'node:readline'

export const readLine = async (query: string): Promise<boolean> => {
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

	return new Promise<boolean>((resolve) => {
		rl.question(query, (answer) => {
			resolve(/^ye?s?/gi.test(answer))
		})
	}).finally(() => {
		rl.close()
	})
}
