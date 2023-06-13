# Room Reservation System UI

This is a user interface (UI) for a room reservation system developed using React and TypeScript. It is a single-page application that enables users to view available rooms, make reservations, and access their reservation details. Additionally, administrators have the ability to manage rooms, reservations, and other system components.

This project relies on the Room Reservation System API to retrieve and manipulate data. The API serves as the backend for the UI, providing the necessary data and functionality for the reservation system.

## Installation

### Prerequisites

- Node.js
- npm
- Room Reservation System API
- Docker (optional)

### Setup

```bash
$ npm install # install dependencies
```

### Running

```bash
$ npm start
```

### Deploying

First, build the project:

```bash
$ npm run build
```

Then, deploy the build directory to a web server. ensure that the web server is configured to reverse proxy `/api` requests to the Room Reservation System API.

The project can also be built using Docker:

```bash
$ docker build -t rrs-ui .
$ id=$(docker create rrs-ui)
$ docker cp $id:/rrs-ui/build .
$ docker rm -v $id
```