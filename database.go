package main

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func connectMongoDB(uri string) (*mongo.Client, error) {
	if uri == "" {
		return nil, fmt.Errorf("MONGODB_URI is required")
	}

	client, err := mongo.Connect(
		options.Client().ApplyURI(uri),
	)
	if err != nil {
		return nil, fmt.Errorf("connect to MongoDB: %w", err)
	}

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	if err := client.Ping(ctx, nil); err != nil {
		_ = client.Disconnect(context.Background())
		return nil, fmt.Errorf("ping MongoDB: %w", err)
	}

	return client, nil
}
