package search

import (
	"log"
	"math"
	"sort"

	"github.com/lithammer/fuzzysearch/fuzzy"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/models"
)

func FuzzySearch(query string, targets []string) fuzzy.Ranks {
	return fuzzy.RankFindNormalizedFold(query, targets)
}

type FuzzySearchStrategy struct {
	pb *pocketbase.PocketBase
}

func NewFuzzySearchStrategy(pb *pocketbase.PocketBase) *FuzzySearchStrategy {
	return &FuzzySearchStrategy{
		pb: pb,
	}
}

func (strategy *FuzzySearchStrategy) Search(query string) ([]SearchResultItem, error) {
	// Get all media records.
	media, err := strategy.pb.Dao().FindRecordsByFilter("media", "text != null", "", 999999, 0)

	if err != nil {
		log.Default().Println("ERROR: Failed to fetch media records: ", err)
		return nil, err
	}

	targets := []string{}
	for _, medium := range media {
		targets = append(targets, medium.GetString("text"))
	}

	matches := FuzzySearch(query, targets)
	sort.Sort(matches)

	result := []SearchResultItem{}
	for _, match := range matches {
		medium := media[match.OriginalIndex]

		result = append(result, SearchResultItem{
			Id:   medium.GetString("id"),
			Text: medium.GetString("text"),
			Url:  medium.GetString("url"),
			// Score: math.Exp(float64(-match.Distance)),
			Score: float64(-match.Distance) / math.Max(float64(len(query)), float64(len(match.Target))),
		})
	}

	return result, nil
}

func (strategy *FuzzySearchStrategy) PrepareRecord(record *models.Record) error {
	// Do nothing.
	return nil
}
