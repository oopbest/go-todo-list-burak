package todo

import (
	"context"
	"errors"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type Handler struct {
	repository *Repository
}

func NewHandler(repository *Repository) *Handler {
	return &Handler{
		repository: repository,
	}
}

func (h *Handler) GetAll(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(
		c.UserContext(),
		5*time.Second,
	)
	defer cancel()

	todos, err := h.repository.FindAll(ctx)
	if err != nil {
		log.Printf("Failed to retrieve todos: %v", err)

		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "Failed to retrieve todos"})
	}

	return c.JSON(todos)
}

func (h *Handler) GetByID(c *fiber.Ctx) error {
	id, err := bson.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "Invalid ID"})
	}

	ctx, cancel := context.WithTimeout(
		c.UserContext(),
		5*time.Second,
	)
	defer cancel()

	todo, err := h.repository.FindByID(ctx, id)

	if errors.Is(err, mongo.ErrNoDocuments) {
		return c.Status(fiber.StatusNotFound).
			JSON(fiber.Map{"error": "Todo not found"})
	}

	if err != nil {
		log.Printf("Failed to retrieve todo: %v", err)

		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "Failed to retrieve todo"})
	}

	return c.JSON(todo)
}

func (h *Handler) Create(c *fiber.Ctx) error {
	var request CreateRequest

	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "Invalid request body"})
	}

	if strings.TrimSpace(request.Body) == "" {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "Body is required"})
	}

	todo := Todo{
		Completed: request.Completed,
		Body:      request.Body,
	}

	ctx, cancel := context.WithTimeout(
		c.UserContext(),
		5*time.Second,
	)
	defer cancel()

	createdTodo, err := h.repository.Create(ctx, todo)
	if err != nil {
		log.Printf("Failed to create todo: %v", err)

		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "Failed to create todo"})
	}

	return c.Status(fiber.StatusCreated).JSON(createdTodo)
}

func (h *Handler) Update(c *fiber.Ctx) error {
	id, err := bson.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "Invalid ID"})
	}

	var request UpdateRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "Invalid request body"})
	}

	updates := bson.M{}

	if request.Completed != nil {
		updates["completed"] = *request.Completed
	}

	if request.Body != nil {
		if strings.TrimSpace(*request.Body) == "" {
			return c.Status(fiber.StatusBadRequest).
				JSON(fiber.Map{"error": "Body is required"})
		}

		updates["body"] = *request.Body
	}

	if len(updates) == 0 {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "No fields to update"})
	}

	ctx, cancel := context.WithTimeout(
		c.UserContext(),
		5*time.Second,
	)
	defer cancel()

	updatedTodo, err := h.repository.Update(ctx, id, updates)

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
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	id, err := bson.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "Invalid ID"})
	}

	ctx, cancel := context.WithTimeout(
		c.UserContext(),
		5*time.Second,
	)
	defer cancel()

	deleted, err := h.repository.Delete(ctx, id)
	if err != nil {
		log.Printf("Failed to delete todo: %v", err)

		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "Failed to delete todo"})
	}

	if !deleted {
		return c.Status(fiber.StatusNotFound).
			JSON(fiber.Map{"error": "Todo not found"})
	}

	return c.Status(fiber.StatusNoContent).Send(nil)
}
