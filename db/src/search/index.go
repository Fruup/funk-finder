package search

import (
	"github.com/pocketbase/pocketbase/models"
)

type SearchResultItem struct {
	Id    string  `json:"id"`
	Text  string  `json:"text"`
	Url   string  `json:"url"`
	Score float64 `json:"score"`
}

type SearchStrategy interface {
	Search(query string) ([]SearchResultItem, error)
	PrepareRecord(record *models.Record) error
}
