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

type SearchResult []SearchResultItem

type SearchStrategy interface {
	Search(query string) (SearchResult, error)
	PrepareRecord(record *models.Record) error
}

// Implement sort.Interface for SearchResult.

func (items SearchResult) Len() int {
	return len(items)
}

func (items SearchResult) Less(i, j int) bool {
	return items[i].Score > items[j].Score // We want descending order.
}

func (items SearchResult) Swap(i, j int) {
	items[i], items[j] = items[j], items[i]
}
