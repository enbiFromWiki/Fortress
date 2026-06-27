package main

import (
	"gateway/backend/api"
)

func main() {
	server := api.NewServer()
	server.Start()
}
