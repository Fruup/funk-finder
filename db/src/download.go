package main

import (
	"io"
	"net/http"
	"os"
)

// From https://gist.github.com/cnu/026744b1e86c6d9e22313d06cba4c2e9
func DownloadFile(url string, filename string) (string, error) {
	// Get the data
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Get file extension
	contentType := resp.Header.Get("Content-Type")

	fileExtension := ""
	switch contentType {
	case "image/jpeg":
		fileExtension = ".jpg"
	case "image/png":
		fileExtension = ".png"
	case "image/webp":
		fileExtension = ".webp"
	}

	// Create the file
	out, err := os.Create(filename + fileExtension)
	if err != nil {
		return "", err
	}
	defer out.Close()

	// Write the body to file
	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return "", err
	}

	return filename + fileExtension, nil
}
