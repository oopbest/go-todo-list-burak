package todo

import "errors"

var (
	ErrCompletedTodoCannotBeReopened = errors.New(
		"completed todo cannot be reopened",
	)

	ErrBodyRequired = errors.New(
		"body is required",
	)

	ErrNoFieldsToUpdate = errors.New(
		"no fields to update",
	)

	ErrInvalidPriority = errors.New(
		"invalid priority",
	)
)

func validateCompletionTransition(
	currentCompleted bool,
	requestedCompleted *bool,
) error {
	// Request ไม่ได้ส่ง completed มา เช่น แก้เฉพาะ body
	if requestedCompleted == nil {
		return nil
	}

	// งานที่เสร็จแล้วห้ามเปลี่ยนกลับเป็นยังไม่เสร็จ
	if currentCompleted && !*requestedCompleted {
		return ErrCompletedTodoCannotBeReopened
	}

	return nil
}
