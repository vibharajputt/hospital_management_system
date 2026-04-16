# Hospital Management System

A Full-Stack robust Hospital Management System designed to streamline healthcare operations. This platform connects patients, doctors, and administrators through dedicated portals, facilitating seamless appointment booking, medical record management, and hospital administration. Built with modern, scalable technologies, it features a premium, highly responsive user interface.

## Table of Contents
- [Features](#features)
- [Architecture & Tech Stack](#architecture--tech-stack)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Database & Backend Setup (via Docker)](#1-database--backend-setup-via-docker)
  - [2. Backend Setup (Local / Maven)](#2-backend-setup-local--maven)
  - [3. Frontend Setup](#3-frontend-setup)
- [API Documentation](#api-documentation)
- [Key Workflows](#key-workflows)

## Features

### Role-Based Access Control
- **Administrative Portal:** Complete oversight of hospital operations, user management, and system analytics.
- **Doctor Portal:** Dashboard for managing schedules, viewing upcoming appointments, updating patient statuses, and issuing prescriptions.
- **Patient Portal:** Secure environment for booking new appointments, viewing medical history, and managing personal profiles.

### Core Functionalities
- **End-to-End Appointment Booking:** Real-time availability checking and scheduling for patients.
- **Consultation Lifecycle:** Doctors can update appointment statuses from scheduled to completed and attach medical records or prescriptions.
- **Secure Authentication:** JWT-based authentication ensuring secure login and session management across all roles.
- **Premium User Interface:** A highly responsive design leveraging modern navigation, state management, and subtle animations for a superior user experience.

## Architecture & Tech Stack

### Backend
The server-side application is built using a robust Java ecosystem.
- **Framework:** Spring Boot 3
- **Language:** Java 17
- **Database:** MySQL 8.0
- **ORM:** Spring Data JPA
- **Security:** Spring Security & JWT (JSON Web Tokens)
- **API Documentation:** Springdoc OpenAPI (Swagger UI)
- **Containerization:** Docker & Docker Compose

### Frontend
The client-side application is a responsive single-page web application.
- **Framework:** React 19 (via Vite)
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Animations:** Framer Motion
- **Notifications:** React Hot Toast
- **Icons:** Lucide React

## Project Structure

The repository is divided into two primary directories:

- `hospital-backend/` : Contains the Spring Boot Java source code, Maven configuration (`pom.xml`), and the `docker-compose.yml` file.
- `hospital-frontend/` : Contains the React source code, Vite configuration, Tailwind settings, and package dependencies (`package.json`).

## Prerequisites

Ensure you have the following installed on your machine before setting up the project:
- Java Development Kit (JDK) 17
- Node.js (Version 18 or higher) and npm
- Maven 3.8+
- Docker Desktop (Required for running the containerized database and backend)

## Getting Started

### 1. Database & Backend Setup (via Docker)

The easiest way to initialize the database and the backend server is by using Docker Compose.

1. Ensure Docker Desktop is running.
2. Navigate to the backend directory:
   `cd hospital-backend`
3. Spin up the containers:
   `docker compose up -d`
   
This command will construct and launch two containers:
- `hospital-mysql`: The database server running on mapped port 3307.
- `hospital-backend`: The Spring Boot API server running on port 8080.

To stop these services later:
`docker compose down -v`

### 2. Backend Setup (Local / Maven)

If you prefer to run the backend manually via Maven without Dockerizing the Java app (but keeping the database containerized):

1. Start only the MySQL database using Docker:
   `docker compose up -d mysql`
2. Navigate to the backend directory:
   `cd hospital-backend`
3. Run the application via the Maven wrapper:
   `mvnw spring-boot:run`
   *(Or just `mvn spring-boot:run` if Maven is globally installed)*

The backend server will run at: `http://localhost:8080`

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   `cd hospital-frontend`
2. Install the JavaScript dependencies:
   `npm install`
3. Start the Vite development server:
   `npm run dev`

The frontend application will be accessible at: `http://localhost:5173`

## API Documentation

The backend exposes a comprehensive OpenAPI specification. Once the backend server is running successfully, you can view the interactive Swagger UI to explore and test the available REST endpoints.

URL: `http://localhost:8080/swagger-ui.html`

## Key Workflows

1. **Patient Registration/Login:** Patients create an account, securely authenticate, and are directed to the patient dashboard.
2. **Scheduling:** Patients browse available doctors and book an empty slot.
3. **Doctor Review:** Doctors log in to their dashboard, review the day's schedule, and process patient appointments.
4. **Conclusion:** Post-consultation, doctors generate records and change the appointment status, which instantly reflects on the patient's portal.
