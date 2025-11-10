#!/bin/bash

# Docker Build and Push Script for Reimbursement App
# Usage: ./docker-build.sh <dockerhub-username>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed!${NC}"
    echo "Please install Docker first:"
    echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "  sudo sh get-docker.sh"
    exit 1
fi

# Use sudo for docker commands if not in docker group
DOCKER_CMD="docker"
if ! docker ps &> /dev/null; then
    echo -e "${YELLOW}Using sudo for Docker commands...${NC}"
    DOCKER_CMD="sudo docker"
fi

# Check if username is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: DockerHub username not provided!${NC}"
    echo "Usage: ./docker-build.sh <dockerhub-username>"
    exit 1
fi

DOCKERHUB_USERNAME=$1
VERSION=${2:-latest}

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}Docker Build & Push Script${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""
echo "DockerHub Username: $DOCKERHUB_USERNAME"
echo "Version Tag: $VERSION"
echo ""

# Check if logged in to DockerHub
echo -e "${YELLOW}Checking DockerHub login...${NC}"
if ! $DOCKER_CMD info | grep -q "Username"; then
    echo -e "${YELLOW}Not logged in. Please login to DockerHub:${NC}"
    $DOCKER_CMD login
fi

echo ""
echo -e "${GREEN}Step 1: Building Backend Image${NC}"
echo "=================================="
cd backend
$DOCKER_CMD build -t $DOCKERHUB_USERNAME/reimbursement-backend:$VERSION .
$DOCKER_CMD tag $DOCKERHUB_USERNAME/reimbursement-backend:$VERSION $DOCKERHUB_USERNAME/reimbursement-backend:latest
echo -e "${GREEN}✓ Backend image built successfully${NC}"
cd ..

echo ""
echo -e "${GREEN}Step 2: Building Frontend Image${NC}"
echo "=================================="
cd frontend
$DOCKER_CMD build -t $DOCKERHUB_USERNAME/reimbursement-frontend:$VERSION .
$DOCKER_CMD tag $DOCKERHUB_USERNAME/reimbursement-frontend:$VERSION $DOCKERHUB_USERNAME/reimbursement-frontend:latest
echo -e "${GREEN}✓ Frontend image built successfully${NC}"
cd ..

echo ""
echo -e "${GREEN}Step 3: Pushing Backend to DockerHub${NC}"
echo "======================================"
$DOCKER_CMD push $DOCKERHUB_USERNAME/reimbursement-backend:$VERSION
$DOCKER_CMD push $DOCKERHUB_USERNAME/reimbursement-backend:latest
echo -e "${GREEN}✓ Backend image pushed successfully${NC}"

echo ""
echo -e "${GREEN}Step 4: Pushing Frontend to DockerHub${NC}"
echo "======================================="
$DOCKER_CMD push $DOCKERHUB_USERNAME/reimbursement-frontend:$VERSION
$DOCKER_CMD push $DOCKERHUB_USERNAME/reimbursement-frontend:latest
echo -e "${GREEN}✓ Frontend image pushed successfully${NC}"

echo ""
echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}✓ All Done!${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""
echo "Images pushed to DockerHub:"
echo "  - $DOCKERHUB_USERNAME/reimbursement-backend:$VERSION"
echo "  - $DOCKERHUB_USERNAME/reimbursement-backend:latest"
echo "  - $DOCKERHUB_USERNAME/reimbursement-frontend:$VERSION"
echo "  - $DOCKERHUB_USERNAME/reimbursement-frontend:latest"
echo ""
echo "To pull and run:"
echo "  docker pull $DOCKERHUB_USERNAME/reimbursement-backend:latest"
echo "  docker pull $DOCKERHUB_USERNAME/reimbursement-frontend:latest"
echo ""
echo "Or use docker-compose:"
echo "  docker-compose up -d"
