import { test, expect } from 'bun:test'
import { ocr } from '../src/ocr'

test('works', async () => {
	const file = `file://${import.meta.dir}/data/image.png`

	const result = ocr(file)

	expect(result).toContain('DAS BEDEUTEN DIE SYMBOLE')
	expect(result).toContain('Waschgang')
	expect(result).toContain('Handwäsche')
	expect(result).toContain('40 Grad')
	expect(result).not.toContain('\n')
})
