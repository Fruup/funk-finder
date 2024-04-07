package search

import (
	"encoding/json"
	"math"
	"myapp/src/openai"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/models"
)

// https://platform.openai.com/docs/guides/embeddings/use-cases
type EmbeddingSearchStrategy struct {
	pb *pocketbase.PocketBase
}

func NewEmbeddingSearchStrategy(pb *pocketbase.PocketBase) *EmbeddingSearchStrategy {
	return &EmbeddingSearchStrategy{
		pb: pb,
	}
}

func ComputeCosineSimilarity(x []float32, y []float32) float32 {
	if len(x) != len(y) {
		return 0
	}

	dotProduct := float32(0.0)
	normX := float32(0.0)
	normY := float32(0.0)

	for i := 0; i < len(x); i++ {
		dotProduct += x[i] * y[i]
		normX += x[i] * x[i]
		normY += y[i] * y[i]
	}

	return dotProduct / float32(math.Sqrt(float64(normX*normY)))
}

func (strategy *EmbeddingSearchStrategy) Search(query string) (SearchResult, error) {
	// Create embedding of query string.
	embedding, err := openai.CreateEmbedding(query)
	if err != nil {
		return nil, err
	}

	// Get embeddings of all media records.
	media, err := strategy.pb.Dao().FindRecordsByFilter("media", "embedding != null", "", 999999, 0)

	if err != nil {
		return nil, err
	}

	result := SearchResult{}

	for _, medium := range media {
		var mediumEmbedding []float32
		json.Unmarshal([]byte(medium.GetString("embedding")), &mediumEmbedding)

		// Compute cosine similarity between query and all media records.
		similarity := ComputeCosineSimilarity(embedding.Embedding, mediumEmbedding)

		result = append(result, SearchResultItem{
			Id:    medium.GetId(),
			Text:  medium.GetString("text"),
			Url:   medium.GetString("url"),
			Score: float64(similarity),
		})
	}

	return result, nil
}

func (strategy *EmbeddingSearchStrategy) PrepareRecord(record *models.Record) error {
	// Create embedding of text field.
	embedding, err := openai.CreateEmbedding(record.GetString("text"))
	if err != nil {
		return err
	}

	// Save embedding to record.
	record.Set("embedding", embedding.Embedding)

	return nil
}
