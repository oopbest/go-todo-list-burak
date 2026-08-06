package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

type Todo struct {
	ID        int    `json:"id"`
	Completed bool   `json:"completed"`
	Body      string `json:"body"`
}

type UpdateTodoRequest struct {
	Completed *bool   `json:"completed"`
	Body      *string `json:"body"`
}

func main() {

	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = "5000"
	}

	// Initialize the todos slice
	todos := []Todo{}

	app := fiber.New()

	// Seed some initial todos
	todos = append(todos, Todo{ID: 1, Completed: false, Body: "Learn Go"})
	todos = append(todos, Todo{ID: 2, Completed: true, Body: "Build a REST API"})
	todos = append(todos, Todo{ID: 3, Completed: false, Body: "Deploy to production"})

	// Get all todos
	app.Get("/api/todos", func(c *fiber.Ctx) error {
		return c.JSON(todos)
	})

	// Get a single todo by ID
	app.Get("/api/todos/:id", func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
		}

		for _, todo := range todos {
			if todo.ID == id {
				return c.JSON(todo)
			}
		}

		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Todo not found"})
	})

	// Create a new todo
	app.Post("/api/todos", func(c *fiber.Ctx) error {
		todo := new(Todo)

		// print debugging information
		log.Printf("Received todo: %+v", todo)

		// print the raw request body for debugging
		log.Printf("Received request body: %s\n", c.Body())

		if err := c.BodyParser(todo); err != nil {
			return err
		}

		// print the parsed todo for debugging
		log.Printf("Received new todo: %+v\n", todo)

		maxID := 0
		for _, existingTodo := range todos {
			if existingTodo.ID > maxID {
				maxID = existingTodo.ID
			}
		}

		todo.ID = maxID + 1

		todos = append(todos, *todo)
		return c.JSON(todos)
	})

	// Update a todo
	app.Patch("/api/todos/:id", func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).
				JSON(fiber.Map{"error": "Invalid ID"})
		}

		var request UpdateTodoRequest
		if err := c.BodyParser(&request); err != nil {
			return c.Status(fiber.StatusBadRequest).
				JSON(fiber.Map{"error": "Invalid request body"})
		}

		if request.Completed == nil && request.Body == nil {
			return c.Status(fiber.StatusBadRequest).
				JSON(fiber.Map{"error": "No fields to update"})
		}

		for i := range todos {
			if todos[i].ID == id {
				if request.Completed != nil {
					todos[i].Completed = *request.Completed
				}

				if request.Body != nil {
					todos[i].Body = *request.Body
				}

				return c.JSON(todos[i])
			}
		}

		return c.Status(fiber.StatusNotFound).
			JSON(fiber.Map{"error": "Todo not found"})
	})

	// Delete a todo
	app.Delete("/api/todos/:id", func(c *fiber.Ctx) error {
		id, err := c.ParamsInt("id")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
		}

		for i, t := range todos {
			if t.ID == id {
				todos = append(todos[:i], todos[i+1:]...)
				return c.JSON(todos)
			}
		}

		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Todo not found"})
	})

	log.Printf("Server running on port %s", PORT)
	log.Fatal(app.Listen(":" + PORT))
}
