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

	// Health check endpoint to check if the server is running
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	todo.RegisterRoutes(app.Group("/api/todos"), todoHandler)

	// API route not found handler
	app.Use("/api", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "API route not found",
		})
	})

	// Serve the React frontend
	app.Static("/", "./frontend/dist")
	// Catch-all route to serve index.html for client-side routing
	app.Get("/*", func(c *fiber.Ctx) error {
		return c.SendFile("./frontend/dist/index.html")
	})

	log.Printf("Server running on port %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
