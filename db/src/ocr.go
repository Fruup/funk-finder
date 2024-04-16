package main

import (
	"log"
	"os"
	"regexp"

	"crypto/rand"
	"math/big"

	"github.com/otiai10/gosseract/v2"
)

func GenerateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	charsetLength := big.NewInt(int64(len(charset)))

	randomString := make([]byte, length)
	for i := 0; i < length; i++ {
		randomIndex, _ := rand.Int(rand.Reader, charsetLength)
		randomString[i] = charset[randomIndex.Int64()]
	}

	return string(randomString)
}

func ImageToText(url string) (string, error) {
	NormalizeText := func(text string) string {
		r := regexp.MustCompile(`\s+`)
		return r.ReplaceAllString(text, " ")
	}

	// Download the image.
	fileName, err := DownloadFile(url, "img_"+GenerateRandomString(8))
	defer os.Remove(fileName)

	if err != nil {
		log.Fatal(err)
	}

	// Extract text from the image.
	client := gosseract.NewClient()
	defer client.Close()

	client.SetConfigFile("./tessdata/configs/default.txt")
	client.SetTessdataPrefix("./tessdata")
	client.SetLanguage("deu")
	client.SetWhitelist("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

	client.SetImage(fileName)
	text, err := client.Text()

	return NormalizeText(text), err

	// TODO: use CLI version....... it yields better results.
}
