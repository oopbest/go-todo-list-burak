package todo

import (
	"context"
	"errors"
	"testing"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type fakeTodoRepository struct {
	findByIDResult Todo
	findByIDError  error

	updateResult Todo
	updateError  error
	updateCalled bool
	receivedID   bson.ObjectID
	receivedData bson.M
}

func (f *fakeTodoRepository) FindByID(
	ctx context.Context,
	id bson.ObjectID,
) (Todo, error) {
	return f.findByIDResult, f.findByIDError
}

func (f *fakeTodoRepository) Update(
	ctx context.Context,
	id bson.ObjectID,
	updates bson.M,
) (Todo, error) {
	f.updateCalled = true
	f.receivedID = id
	f.receivedData = updates

	return f.updateResult, f.updateError
}

func TestServiceUpdateCompletedTodoCannotBeReopened(t *testing.T) {
	repository := &fakeTodoRepository{
		findByIDResult: Todo{
			Completed: true,
		},
	}

	service := NewService(repository)

	requestedCompleted := false

	_, err := service.Update(
		context.Background(),
		bson.NewObjectID(),
		UpdateRequest{
			Completed: &requestedCompleted,
		},
	)

	if !errors.Is(err, ErrCompletedTodoCannotBeReopened) {
		t.Fatalf(
			"error = %v; want %v",
			err,
			ErrCompletedTodoCannotBeReopened,
		)
	}

	if repository.updateCalled {
		t.Error("repository.Update() should not be called")
	}
}

func TestServiceUpdateAllowedCompletionTransitions(t *testing.T) {
	tests := []struct {
		name             string
		currentCompleted bool
		nextCompleted    bool
	}{
		{
			name:             "in progress changes to done",
			currentCompleted: false,
			nextCompleted:    true,
		},
		{
			name:             "in progress remains in progress",
			currentCompleted: false,
			nextCompleted:    false,
		},
		{
			name:             "done remains done",
			currentCompleted: true,
			nextCompleted:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			id := bson.NewObjectID()

			expectedTodo := Todo{
				ID:        id,
				Completed: tt.nextCompleted,
				Body:      "Learn Go",
			}

			repository := &fakeTodoRepository{
				findByIDResult: Todo{
					ID:        id,
					Completed: tt.currentCompleted,
					Body:      "Learn Go",
				},
				updateResult: expectedTodo,
			}

			service := NewService(repository)

			result, err := service.Update(
				context.Background(),
				id,
				UpdateRequest{
					Completed: &tt.nextCompleted,
				},
			)
			if err != nil {
				t.Fatalf("Service.Update() error = %v", err)
			}

			if !repository.updateCalled {
				t.Fatal("repository.Update() was not called")
			}

			if repository.receivedID != id {
				t.Errorf(
					"repository received ID = %s; want %s",
					repository.receivedID.Hex(),
					id.Hex(),
				)
			}

			completed, ok := repository.receivedData["completed"].(bool)
			if !ok {
				t.Fatal(`updates["completed"] is not a bool`)
			}

			if completed != tt.nextCompleted {
				t.Errorf(
					"completed update = %v; want %v",
					completed,
					tt.nextCompleted,
				)
			}

			if result != expectedTodo {
				t.Errorf(
					"result = %+v; want %+v",
					result,
					expectedTodo,
				)
			}
		})
	}
}
