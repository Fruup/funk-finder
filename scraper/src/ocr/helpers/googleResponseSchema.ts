interface Vertex {
	x: number
	y: number
}

interface BoundingBox {
	vertices: Vertex[]
}

interface DetectedLanguage {
	confidence: number
	languageCode: string
}

interface DetectedBreak {
	type: string
}

interface Symbol {
	boundingBox: BoundingBox
	text: string
	property?: {
		detectedBreak?: DetectedBreak
	}
}

interface Word {
	boundingBox: BoundingBox
	symbols: Symbol[]
	property?: {
		detectedLanguages?: DetectedLanguage[]
	}
}

interface Paragraph {
	boundingBox: BoundingBox
	words: Word[]
}

interface Block {
	blockType: string
	boundingBox: BoundingBox
	paragraphs: Paragraph[]
}

interface Page {
	blocks: Block[]
	width: number
	height: number
	property?: {
		detectedLanguages: DetectedLanguage[]
	}
}

interface FullTextAnnotation {
	pages: Page[]
	text: string
}

interface BoundingPoly {
	vertices: Vertex[]
}

interface TextAnnotation {
	boundingPoly: BoundingPoly
	description: string
	locale?: string
}

interface Response {
	fullTextAnnotation: FullTextAnnotation
	textAnnotations: TextAnnotation[]
}

export interface RootObject {
	responses: Response[]
}
