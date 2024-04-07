package openai

import (
	"context"
	"errors"
	"log"
	"os"

	openai "github.com/sashabaranov/go-openai"
)

func RefineText(text string) (string, error) {
	SYSTEM_PROMPT, err := os.ReadFile("src/system_prompt.txt")
	if err != nil {
		return "", err
	}

	client := openai.NewClient(os.Getenv("OPENAI_API_KEY"))

	response, err := client.CreateChatCompletion(context.Background(), openai.ChatCompletionRequest{
		Model: openai.GPT3Dot5Turbo,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleSystem,
				Content: string(SYSTEM_PROMPT),
			},
			{
				Role:    openai.ChatMessageRoleUser,
				Content: text,
			},
		},
	})

	if err != nil {
		log.Fatal(err)
	}

	if len(response.Choices) == 0 {
		return "", errors.New("no choices in response")
	}

	return response.Choices[0].Message.Content, err
}

func CreateEmbedding(text string) (*openai.Embedding, error) {
	client := openai.NewClient(os.Getenv("OPENAI_API_KEY"))

	response, err := client.CreateEmbeddings(context.Background(), openai.EmbeddingRequest{
		Model: openai.SmallEmbedding3,
		Input: text,
	})

	if err != nil {
		return nil, err
	}

	return &response.Data[0], nil
}
