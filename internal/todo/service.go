package todo

import (
	"context"
	"strings"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type TodoRepository interface {
	FindByID(
		ctx context.Context,
		id bson.ObjectID,
	) (Todo, error)

	Update(
		ctx context.Context,
		id bson.ObjectID,
		updates bson.M,
	) (Todo, error)
}

type Service struct {
	repository TodoRepository
}

func NewService(repository TodoRepository) *Service {
	return &Service{
		repository: repository,
	}
}

func (s *Service) Update(
	ctx context.Context,
	id bson.ObjectID,
	request UpdateRequest,
) (Todo, error) {
	updates := bson.M{}

	// Validate body if it's provided in the request
	if request.Body != nil {
		if strings.TrimSpace(*request.Body) == "" {
			return Todo{}, ErrBodyRequired
		}

		updates["body"] = *request.Body
	}

	// Validate completed if it's provided in the request
	if request.Completed != nil {
		currentTodo, err := s.repository.FindByID(ctx, id)
		if err != nil {
			return Todo{}, err
		}

		if err := validateCompletionTransition(
			currentTodo.Completed,
			request.Completed,
		); err != nil {
			return Todo{}, err
		}

		updates["completed"] = *request.Completed
	}

	// Validate priority if it's provided in the request
	if request.Priority != nil {
		if !request.Priority.IsValid() {
			return Todo{}, ErrInvalidPriority
		}

		updates["priority"] = *request.Priority
	}

	// If no fields are provided for update, return an error
	if len(updates) == 0 {
		return Todo{}, ErrNoFieldsToUpdate
	}

	return s.repository.Update(ctx, id, updates)
}
