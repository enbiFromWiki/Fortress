package main

import "gateway/api"

// "gateway/api"

func main() {
	server := api.NewServer()
	server.Start()
}
