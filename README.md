![CI](https://github.com/JourneyCodesAyush/javabhailang/actions/workflows/ci.yml/badge.svg)

# Chai aur Code

This repo contains code from the series `Chai aur Code Backend Series`

Here's the [data model](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj).

---

## Docker Setup

This project includes a Docker setup with:

- Node.js backend container
- MongoDB container
- Persistent MongoDB storage using Docker volumes

### Run with Docker Compose

Make sure Docker is installed, then run:

```bash
docker compose up --build
```

To run in detached mode:

```bash
docker compose up -d --build
```

The backend will be available at:

```txt
http://localhost:8000
```

MongoDB runs on:

```txt
mongodb://localhost:27017
```

### Stop containers

```bash
docker compose down
```

The MongoDB data is persisted using a Docker volume, so stopping containers will not remove the database data.

---

## Testing

This project has automated tests for the user controller and its auth middleware, using [Vitest](https://vitest.dev/) and [Supertest](https://github.com/ladjs/supertest), backed by an in-memory MongoDB instance ([`mongodb-memory-server`](https://github.com/typegoose/mongodb-memory-server)) — no real database or network calls required.

### Run tests

```bash
npm run test
```

### Coverage

- User registration, login, and logout (happy paths + negative/validation cases)
- `verifyJWT` auth middleware (missing token, malformed token, invalid signature, expired token, valid token for a deleted/nonexistent user)
- `getCurrentUser`

Other controllers are not currently covered — this repo is for learning purposes, and testing effort was focused on the user controller and the auth flow it depends on.
