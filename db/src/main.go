package main

import (
	"fmt"
	"log"
	"myapp/src/openai"
	"myapp/src/search"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
	"github.com/lithammer/fuzzysearch/fuzzy"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/hook"
)

type App struct {
	pb *pocketbase.PocketBase
	// timer          *time.Timer
	searchStrategy search.SearchStrategy
}

func NewApp() *App {
	pb := pocketbase.New()

	return &App{
		pb: pb,
		// searchStrategy: search.NewFuzzySearchStrategy(pb),
		searchStrategy: search.NewEmbeddingSearchStrategy(pb),
	}
}

// func (app *App) scheduleBuildSearchIndexTask() {
// 	if app.timer != nil {
// 		app.timer.Stop()
// 	}

// 	app.timer = time.AfterFunc(
// 		1*time.Minute,
// 		func() {
// 			log.Default().Printf("Running index task at %s", time.Now().String())
// 			app.searchStrategy.BuildIndex()
// 		})
// }

func (app *App) Start() {
	if err := app.pb.Start(); err != nil {
		log.Fatal(err)
	}
}

func main() {
	godotenv.Load()

	app := NewApp()

	// Add route for searching.
	app.pb.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.GET("/search", func(c echo.Context) error {
			query := c.QueryParam("q")

			result, err := app.searchStrategy.Search(query)
			if err != nil {
				return c.String(http.StatusInternalServerError, "Failed to search")
			}

			return c.JSON(http.StatusOK, result)
		})

		return nil
	})

	app.pb.OnRecordBeforeCreateRequest("media").Add(func(e *core.RecordCreateEvent) error {
		url := e.Record.GetString("url")

		// Extract text from the image and update the record.
		if text, err := ImageToText(url); err != nil {
			fmt.Printf("Failed to extract text from image: %s", err)
		} else {
			isInfoPost := fuzzy.MatchFold("Danke, dass ihr auch Info-Posts einen Like gebt", text)

			if isInfoPost {
				// skip
				return hook.StopPropagation
			}

			// Refine text using AI, removing any unwanted characters.
			refinedText, err := openai.RefineText(text)
			if err != nil {
				log.Default().Println("ERROR: Failed to refine text: ", err)
				e.Record.Set("text", text)
			} else {
				e.Record.Set("text", refinedText)
			}
		}

		// Create embedding of text field.
		app.searchStrategy.PrepareRecord(e.Record)

		// Schedule a task to rebuild the search index.
		// app.scheduleBuildSearchIndexTask()

		return nil
	})

	app.pb.OnRecordBeforeUpdateRequest("media").Add(func(e *core.RecordUpdateEvent) error {
		// TODO

		// Schedule a task to rebuild the search index.
		// app.scheduleBuildSearchIndexTask()

		return nil
	})

	// Start the application.
	app.Start()
}
