package todo

import "github.com/gofiber/fiber/v2"

func RegisterRoutes(router fiber.Router, handler *Handler) {
	router.Get("/", handler.GetAll)
	router.Get("/:id", handler.GetByID)
	router.Post("/", handler.Create)
	router.Patch("/:id", handler.Update)
	router.Delete("/:id", handler.Delete)
}
