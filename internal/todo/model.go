package todo

import "go.mongodb.org/mongo-driver/v2/bson"

type Todo struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Completed bool          `bson:"completed" json:"completed"`
	Body      string        `bson:"body" json:"body"`
}

type CreateRequest struct {
	Completed bool   `json:"completed"`
	Body      string `json:"body"`
}

type UpdateRequest struct {
	Completed *bool   `json:"completed"`
	Body      *string `json:"body"`
}
