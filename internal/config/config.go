package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port          string
	MongoURI      string
	MongoDatabase string
}

func Load() (Config, error) {
	_ = godotenv.Load()

	cfg := Config{
		Port:          os.Getenv("PORT"),
		MongoURI:      os.Getenv("MONGODB_URI"),
		MongoDatabase: os.Getenv("MONGODB_DATABASE"),
	}

	if cfg.Port == "" {
		cfg.Port = "5000"
	}

	if cfg.MongoDatabase == "" {
		cfg.MongoDatabase = "todo_app"
	}

	if cfg.MongoURI == "" {
		return Config{}, fmt.Errorf("MONGODB_URI is required")
	}

	return cfg, nil
}
