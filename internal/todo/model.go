package todo

import "go.mongodb.org/mongo-driver/v2/bson"

type Priority string

const (
	PriorityLow    Priority = "low"
	PriorityMedium Priority = "medium"
	PriorityHigh   Priority = "high"
)

func (p Priority) IsValid() bool {
	switch p {
	case PriorityLow, PriorityMedium, PriorityHigh:
		return true
	default:
		return false
	}
}

type Todo struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Completed bool          `bson:"completed" json:"completed"`
	Body      string        `bson:"body" json:"body"`
	Priority  Priority      `bson:"priority" json:"priority"`
}

type CreateRequest struct {
	Completed bool      `json:"completed"`
	Body      string    `json:"body"`
	Priority  *Priority `json:"priority"`
}

type UpdateRequest struct {
	Completed *bool     `json:"completed"`
	Body      *string   `json:"body"`
	Priority  *Priority `json:"priority"`
}
