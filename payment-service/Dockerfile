# Stage 1: Build Binary
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY main.go .
RUN CGO_ENABLED=0 GOOS=linux go build -o payment-service main.go

# Stage 2: Runtime Environment
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/payment-service .

EXPOSE 8085
CMD ["./payment-service"]