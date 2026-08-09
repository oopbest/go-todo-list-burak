package todo

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
)

type errorResponse struct {
	Error string `json:"error"`
}

func TestHandlerUpdateValidation(t *testing.T) {
	const validID = "507f1f77bcf86cd799439011"

	tests := []struct {
		name        string
		path        string
		requestBody string
		wantStatus  int
		wantError   string
	}{
		{
			name:        "invalid todo ID",
			path:        "/api/todos/not-an-id",
			requestBody: `{"completed":true}`,
			wantStatus:  fiber.StatusBadRequest,
			wantError:   "Invalid ID",
		},
		{
			name:        "invalid JSON body",
			path:        "/api/todos/" + validID,
			requestBody: `{"completed":`,
			wantStatus:  fiber.StatusBadRequest,
			wantError:   "Invalid request body",
		},
		{
			name:        "body cannot be blank",
			path:        "/api/todos/" + validID,
			requestBody: `{"body":"   "}`,
			wantStatus:  fiber.StatusBadRequest,
			wantError:   "Body is required",
		},
		{
			name:        "no fields to update",
			path:        "/api/todos/" + validID,
			requestBody: `{}`,
			wantStatus:  fiber.StatusBadRequest,
			wantError:   "No fields to update",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			app := fiber.New()

			// Validation cases return before accessing the repository,
			// so MongoDB is not required for these tests.
			handler := NewHandler(nil)

			app.Patch("/api/todos/:id", handler.Update)

			request := httptest.NewRequest(
				http.MethodPatch,
				tt.path,
				strings.NewReader(tt.requestBody),
			)
			request.Header.Set(
				fiber.HeaderContentType,
				fiber.MIMEApplicationJSON,
			)

			response, err := app.Test(request)
			if err != nil {
				t.Fatalf("app.Test() returned an error: %v", err)
			}
			defer response.Body.Close()

			if response.StatusCode != tt.wantStatus {
				t.Errorf(
					"status code = %d; want %d",
					response.StatusCode,
					tt.wantStatus,
				)
			}

			var responseBody errorResponse

			if err := json.NewDecoder(response.Body).Decode(&responseBody); err != nil {
				t.Fatalf("failed to decode response: %v", err)
			}

			if responseBody.Error != tt.wantError {
				t.Errorf(
					"error = %q; want %q",
					responseBody.Error,
					tt.wantError,
				)
			}
		})
	}
}
