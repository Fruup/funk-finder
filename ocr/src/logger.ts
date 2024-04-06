import path from 'node:path'

const logger = {
	_dir: 'logs',

	async write(dst: string, object: any) {
		await Bun.write(path.join(this._dir, dst + '.json'), JSON.stringify(object))
	},
}

export default logger
