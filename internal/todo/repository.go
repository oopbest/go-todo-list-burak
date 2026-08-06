package todo

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Repository struct {
	collection *mongo.Collection
}

func NewRepository(database *mongo.Database) *Repository {
	return &Repository{
		collection: database.Collection("todos"),
	}
}

func (r *Repository) FindAll(ctx context.Context) ([]Todo, error) {
	cursor, err := r.collection.Find(ctx, bson.D{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	todos := make([]Todo, 0)

	if err := cursor.All(ctx, &todos); err != nil {
		return nil, err
	}

	return todos, nil
}

func (r *Repository) FindByID(
	ctx context.Context,
	id bson.ObjectID,
) (Todo, error) {
	var todo Todo

	err := r.collection.
		FindOne(ctx, bson.M{"_id": id}).
		Decode(&todo)

	if err != nil {
		return Todo{}, err
	}

	return todo, nil
}

func (r *Repository) Create(
	ctx context.Context,
	todo Todo,
) (Todo, error) {
	result, err := r.collection.InsertOne(ctx, todo)
	if err != nil {
		return Todo{}, err
	}

	insertedID, ok := result.InsertedID.(bson.ObjectID)
	if !ok {
		return Todo{}, fmt.Errorf(
			"unexpected inserted ID type: %T",
			result.InsertedID,
		)
	}

	todo.ID = insertedID

	return todo, nil
}

func (r *Repository) Update(
	ctx context.Context,
	id bson.ObjectID,
	updates bson.M,
) (Todo, error) {
	if len(updates) == 0 {
		return Todo{}, fmt.Errorf("updates cannot be empty")
	}

	var updatedTodo Todo

	err := r.collection.FindOneAndUpdate(
		ctx,
		bson.M{"_id": id},
		bson.M{"$set": updates},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&updatedTodo)
	if err != nil {
		return Todo{}, err
	}

	return updatedTodo, nil
}

func (r *Repository) Delete(
	ctx context.Context,
	id bson.ObjectID,
) (bool, error) {
	result, err := r.collection.DeleteOne(
		ctx,
		bson.M{"_id": id},
	)
	if err != nil {
		return false, err
	}

	return result.DeletedCount > 0, nil
}
