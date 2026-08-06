package main

import (
	"context"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/oopbest/react-go-tut/internal/config"
	"github.com/oopbest/react-go-tut/internal/database"
	"github.com/oopbest/react-go-tut/internal/todo"
)

func main() {

	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	mongoClient, err := database.Connect(cfg.MongoURI)
	if err != nil {
		log.Fatal(err)
	}
	defer mongoClient.Disconnect(context.Background())

	db := mongoClient.Database(cfg.MongoDatabase)

	todoRepository := todo.NewRepository(db)
	todoHandler := todo.NewHandler(todoRepository)

	app := fiber.New()

	todo.RegisterRoutes(app.Group("/api/todos"), todoHandler)

	log.Printf("Server running on port %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
