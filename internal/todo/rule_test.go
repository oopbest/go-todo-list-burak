package todo

import (
	"errors"
	"testing"
)

func boolPointer(value bool) *bool {
	return &value
}

func TestValidateCompletionTransition(t *testing.T) {
	tests := []struct {
		name               string
		currentCompleted   bool
		requestedCompleted *bool
		wantError          error
	}{
		{
			name:               "in progress remains in progress",
			currentCompleted:   false,
			requestedCompleted: boolPointer(false),
			wantError:          nil,
		},
		{
			name:               "in progress changes to done",
			currentCompleted:   false,
			requestedCompleted: boolPointer(true),
			wantError:          nil,
		},
		{
			name:               "done remains done",
			currentCompleted:   true,
			requestedCompleted: boolPointer(true),
			wantError:          nil,
		},
		{
			name:               "done cannot return to in progress",
			currentCompleted:   true,
			requestedCompleted: boolPointer(false),
			wantError:          ErrCompletedTodoCannotBeReopened,
		},
		{
			name:               "completed field is omitted",
			currentCompleted:   true,
			requestedCompleted: nil,
			wantError:          nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateCompletionTransition(
				tt.currentCompleted,
				tt.requestedCompleted,
			)

			if !errors.Is(err, tt.wantError) {
				t.Errorf(
					"validateCompletionTransition() error = %v; want %v",
					err,
					tt.wantError,
				)
			}
		})
	}
}
