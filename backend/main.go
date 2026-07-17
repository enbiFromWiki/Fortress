package main

import (
	"gateway/api"
)

func main() {
	server := api.NewServer()
	server.Start()
}
