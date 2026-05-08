SHELL := /bin/bash

.PHONY: install test dev build deploy-devnet clean

install:
	@echo "Installing root, frontend and OCR dependencies..."
	npm install
	cd frontend && npm install
	cd ocr-service && npm install

test:
	@echo "Running Anchor test suite..."
	npm test

dev:
	@echo "Starting frontend development server..."
	cd frontend && npm run dev

build:
	@echo "Building frontend application..."
	cd frontend && npm run build

deploy-devnet:
	@echo "Building and deploying program to Devnet..."
	./deploy-devnet.sh

clean:
	@echo "Cleaning node_modules and build artifacts..."
	rm -rf node_modules frontend/node_modules ocr-service/node_modules frontend/dist
