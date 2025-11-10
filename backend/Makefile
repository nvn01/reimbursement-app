.PHONY: run build clean test setup-db

# Run the application
run:
	export PATH=$$PATH:/usr/local/go/bin && go run cmd/api/main.go

# Build the application
build:
	export PATH=$$PATH:/usr/local/go/bin && go build -o bin/api cmd/api/main.go

# Clean build artifacts
clean:
	rm -rf bin/

# Run tests
test:
	export PATH=$$PATH:/usr/local/go/bin && go test -v ./...

# Setup database
setup-db:
	./scripts/setup_db.sh

# Install dependencies
deps:
	export PATH=$$PATH:/usr/local/go/bin && go mod download

# Format code
fmt:
	export PATH=$$PATH:/usr/local/go/bin && go fmt ./...

# Run with hot reload (requires air)
dev:
	export PATH=$$PATH:/usr/local/go/bin && air

# Help
help:
	@echo "Available targets:"
	@echo "  run       - Run the application"
	@echo "  build     - Build the application"
	@echo "  clean     - Clean build artifacts"
	@echo "  test      - Run tests"
	@echo "  setup-db  - Setup database"
	@echo "  deps      - Install dependencies"
	@echo "  fmt       - Format code"
	@echo "  dev       - Run with hot reload"
