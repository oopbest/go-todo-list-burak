package main

import (
	"context"
	"errors"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Todo struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Completed bool          `bson:"completed" json:"completed"`
	Body      string        `bson:"body" json:"body"`
}
type CreateTodoRequest struct {
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

	// Connect to MongoDB
	mongoURI := os.Getenv("MONGODB_URI")
	mongoDatabaseName := os.Getenv("MONGODB_DATABASE")

	if mongoDatabaseName == "" {
		mongoDatabaseName = "todo_app"
	}

	mongoClient, err := connectMongoDB(mongoURI)
	if err != nil {
		log.Fatal(err)
	}

	defer func() {
		ctx, cancel := context.WithTimeout(
			context.Background(),
			10*time.Second,
		)
		defer cancel()

		if err := mongoClient.Disconnect(ctx); err != nil {
			log.Printf("Failed to disconnect MongoDB: %v", err)
		}
	}()

	mongoDatabase := mongoClient.Database(mongoDatabaseName)
	todoCollection := mongoDatabase.Collection("todos")

	log.Printf(
		"Connected to MongoDB database: %s",
		mongoDatabase.Name(),
	)

	app := fiber.New()

	// Get all todos
	app.Get("/api/todos", func(c *fiber.Ctx) error {
		ctx, cancel := context.WithTimeout(
			context.Background(),
			5*time.Second,
		)
		defer cancel()

		cursor, err := todoCollection.Find(ctx, bson.D{})
		if err != nil {
			log.Printf("Failed to find todos: %v", err)

			return c.Status(fiber.StatusInternalServerError).
				JSON(fiber.Map{"error": "Failed to retrieve todos"})
		}
		defer cursor.Close(ctx)

		todos := make([]Todo, 0)

		if err := cursor.All(ctx, &todos); err != nil {
			log.Printf("Failed to decode todos: %v", err)

			return c.Status(fiber.StatusInternalServerError).
				JSON(fiber.Map{"error": "Failed to retrieve todos"})
		}

		return c.JSON(todos)
	})

	// Get a single todo by ID
	app.Get("/api/todos/:id", func(c *fiber.Ctx) error {
		id, err := bson.ObjectIDFromHex(c.Params("id"))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).
				JSON(fiber.Map{"error": "Invalid ID"})
		}

		ctx, cancel := context.WithTimeout(
			context.Background(),
			5*time.Second,
		)
		defer cancel()

		var todo Todo

		err = todoCollection.
			FindOne(ctx, bson.M{"_id": id}).
			Decode(&todo)

		if errors.Is(err, mongo.ErrNoDocuments) {
			return c.Status(fiber.StatusNotFound).
				JSON(fiber.Map{"error": "Todo not found"})
		}

		if err != nil {
			log.Printf("Failed to find todo: %v", err)

			return c.Status(fiber.StatusInternalServerError).
				JSON(fiber.Map{"error": "Failed to retrieve todo"})
		}

		return c.JSON(todo)
	})

	// Create a new todo
	app.Post("/api/todos", func(c *fiber.Ctx) error {
		var request CreateTodoRequest

		if err := c.BodyParser(&request); err != nil {
			return c.Status(fiber.StatusBadRequest).
				JSON(fiber.Map{"error": "Invalid request body"})
		}

		if request.Body == "" {
			return c.Status(fiber.StatusBadRequest).
				JSON(fiber.Map{"error": "Body is required"})
		}

		todo := Todo{
			Completed: request.Completed,
			Body:      request.Body,
		}

		ctx, cancel := context.WithTimeout(
			context.Background(),
			5*time.Second,
		)
		defer cancel()

		result, err := todoCollection.InsertOne(ctx, todo)
		if err != nil {
			log.Printf("Failed to create todo: %v", err)

			return c.Status(fiber.StatusInternalServerError).
				JSON(fiber.Map{"error": "Failed to create todo"})
		}

		insertedID, ok := result.InsertedID.(bson.ObjectID)
		if !ok {
			log.Printf("Unexpected inserted ID type: %T", result.InsertedID)

			return c.Status(fiber.StatusInternalServerError).
				JSON(fiber.Map{"error": "Failed to create todo"})
		}

		todo.ID = insertedID

		return c.Status(fiber.StatusCreated).JSON(todo)
	})

	// Update a todo
	app.Patch("/api/todos/:id", func(c *fiber.Ctx) error {
		id, err := bson.ObjectIDFromHex(c.Params("id"))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).
				JSON(fiber.Map{"error": "Invalid ID"})
		}

		var request UpdateTodoRequest

		if err := c.BodyParser(&request); err != nil {
			return c.Status(fiber.StatusBadRequest).
				JSON(fiber.Map{"error": "Invalid request body"})
		}

		updates := bson.M{}

		if request.Completed != nil {
			updates["completed"] = *request.Completed
		}

		if request.Body != nil {
			updates["body"] = *request.Body
		}

		if len(updates) == 0 {
			return c.Status(fiber.StatusBadRequest).
				JSON(fiber.Map{"error": "No fields to update"})
		}

		ctx, cancel := context.WithTimeout(
			context.Background(),
			5*time.Second,
		)
		defer cancel()

		var updatedTodo Todo

		err = todoCollection.FindOneAndUpdate(
			ctx,
			bson.M{"_id": id},
			bson.M{"$set": updates},
			options.FindOneAndUpdate().
				SetReturnDocument(options.After),
		).Decode(&updatedTodo)

		if errors.Is(err, mongo.ErrNoDocuments) {
			return c.Status(fiber.StatusNotFound).
				JSON(fiber.Map{"error": "Todo not found"})
		}

		if err != nil {
			log.Printf("Failed to update todo: %v", err)

			return c.Status(fiber.StatusInternalServerError).
				JSON(fiber.Map{"error": "Failed to update todo"})
		}

		return c.JSON(updatedTodo)
	})

	// Delete a todo
	app.Delete("/api/todos/:id", func(c *fiber.Ctx) error {
		id, err := bson.ObjectIDFromHex(c.Params("id"))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).
				JSON(fiber.Map{"error": "Invalid ID"})
		}

		ctx, cancel := context.WithTimeout(
			context.Background(),
			5*time.Second,
		)
		defer cancel()

		result, err := todoCollection.DeleteOne(
			ctx,
			bson.M{"_id": id},
		)
		if err != nil {
			log.Printf("Failed to delete todo: %v", err)

			return c.Status(fiber.StatusInternalServerError).
				JSON(fiber.Map{"error": "Failed to delete todo"})
		}

		if result.DeletedCount == 0 {
			return c.Status(fiber.StatusNotFound).
				JSON(fiber.Map{"error": "Todo not found"})
		}

		return c.Status(fiber.StatusNoContent).Send(nil)
	})

	log.Printf("Server running on port %s", PORT)
	log.Fatal(app.Listen(":" + PORT))
}
