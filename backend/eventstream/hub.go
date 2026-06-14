package eventstream

import "sync"

type Hub struct {
	Clients map[string]bool
	mu      sync.RWMutex
}
