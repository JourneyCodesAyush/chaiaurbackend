![CI](https://github.com/JourneyCodesAyush/chaiaurbackend/actions/workflows/ci.yml/badge.svg)

# VideoTube — YouTube-like Backend API

A backend REST API for a YouTube-like platform, built with Node.js, Express, and MongoDB.

User authentication was built following the [Chai aur Code Backend Series](https://www.youtube.com/@chaiaurcode) by Hitesh Choudhary. All feature controllers — videos, likes, comments, playlists, subscriptions, tweets, and channel dashboard — were implemented independently.

Here's the [data model](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj).

---

## Features

- JWT auth with access and refresh tokens
- Video upload and management via Cloudinary
- Like/unlike videos, comments, and tweets
- Comment and reply system
- Playlist creation and management
- Channel subscriptions
- Channel dashboard with aggregated stats (total views, likes, subscribers, videos)

---

## Tech Stack

Node.js, Express, MongoDB, Mongoose, Cloudinary, JWT, Docker

---

## API Overview

| Module        | Endpoints                                              |
| ------------- | ------------------------------------------------------ |
| Auth / Users  | register, login, logout, refresh token, update profile |
| Videos        | upload, fetch, update, delete, toggle publish          |
| Likes         | toggle like on video / comment / tweet                 |
| Comments      | add, update, delete, fetch by video                    |
| Playlists     | create, update, delete, add/remove video               |
| Subscriptions | subscribe, unsubscribe, fetch subscribers              |
| Tweets        | create, update, delete, fetch by user                  |
| Dashboard     | channel stats, channel videos                          |

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
```
http://localhost:8000
```

MongoDB runs on:
```
mongodb://localhost:27017
```


### Stop containers

```bash
docker compose down
```

MongoDB data is persisted using a Docker volume — stopping containers will not remove the database.

---

## Testing

Automated tests for the user controller and auth middleware using [Vitest](https://vitest.dev/) and [Supertest](https://github.com/ladjs/supertest), backed by an in-memory MongoDB instance ([`mongodb-memory-server`](https://github.com/typegoose/mongodb-memory-server)) — no real database or network calls required.

### Run tests

```bash
npm run test
```

### Coverage

- User registration, login, and logout (happy paths + validation cases)
- `verifyJWT` auth middleware (missing token, malformed token, invalid signature, expired token, valid token for deleted user)
- `getCurrentUser`

Other controllers are not currently covered — testing effort was focused on the auth flow.
