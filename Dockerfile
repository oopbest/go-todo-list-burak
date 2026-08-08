# Build React frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# Build Go backend
FROM golang:1.26-alpine AS backend-builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./
COPY internal/ ./internal/

RUN CGO_ENABLED=0 GOOS=linux \
    go build \
    -trimpath \
    -ldflags="-s -w" \
    -o /app/server \
    .


# Production image
FROM alpine:3.22

RUN apk add --no-cache ca-certificates tzdata \
    && addgroup -S app \
    && adduser -S app -G app

WORKDIR /app

COPY --from=backend-builder /app/server ./server
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

USER app

ENV PORT=10000

EXPOSE 10000

CMD ["./server"]