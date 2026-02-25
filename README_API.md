# SwadesiBank — Backend API Reference

This document lists the backend API endpoints implemented in the `jpmcbank` Express app.

Base URL (local / compose): http://localhost:4300

Notes:
- The backend connects to MongoDB via the `MONGO_URI` environment variable. When using the provided Docker Compose, it is set to `mongodb://mongo:27017/jpmcbank`.
- Passwords are compared/hashed with `bcrypt`. There is no JWT/session based auth in this code — endpoints expect the client to provide credentials where required.

---

## Branches

- **POST /branches**
  - Description: Create a new branch.
  - Request body: JSON representing a branch (fields defined in `jpmcbank/models/branch.js`). Example:
    ```json
    { "branchName": "Main Branch", "branchAddress": "..." }
    ```
  - Response: `201` with created branch document.

- **GET /branches**
  - Description: Retrieve all branches.
  - Response: `200` with array of branch documents.

- **GET /branch/:id**
  - Description: Retrieve a branch by its `_id`.
  - Response: `200` with branch document or `404` if not found.

- **GET /branches/stats**
  - Description: Aggregated stats per branch (customer count and sum of `availableBalance`).
  - Response: `200` with aggregated array of objects: `{ branchName, customerCount, totalNetValue }`.

## Employees & Users (Customers collection used for both)

- **POST /employee**
  - Description: Create an employee (stored in `customers` collection with `role: 'employee'`).
  - Request body: employee data (see `jpmcbank/models/customers.js`).
  - Response: `201` with created employee.

- **GET /employee/:id**
  - Description: Get an employee by id.
  - Response: `200` with employee or `404`.

- **GET /employees**
  - Description: Get all users with `role: 'employee'`.
  - Response: `200` with array of employees.

- **PUT /employee/:id**
  - Description: Update an employee's fields. Body contains fields to update.
  - Response: `200` with updated employee or `404`.

- **GET /employees/:branchid**
  - Description: Get all employees that belong to a branch (`branch` field equals `branchid`).
  - Response: `200` with array of employees.

## Registration & Authentication

- **POST /registration**
  - Description: Register a new user (customer or employee). Ensures `name` (username), `email`, and `mobile` are unique. Sends a registration email via configured transporter.
  - Request body example (customer):
    ```json
    { "name":"alice", "email":"a@e.com", "mobile":"9876543210", "password":"secret", "role":"customer", "branch": "<branchId>" }
    ```
  - Response: `201` with message on success; `400` when username/email/mobile already in use.

- **POST /login**
  - Description: Log in with `email` and `password`. Returns user role and id on success.
  - Request body:
    ```json
    { "email":"a@e.com", "password":"secret" }
    ```
  - Responses:
    - `200`: `{ message: 'Login successful', role: 'customer'|'employee', customerId/employeeId, ... }`
    - `404`: user not found
    - `401`: invalid password

## Customers

- **PUT /customer/:id**
  - Description: Update a customer's profile. Body contains updated fields.
  - Response: `200` with updated customer or `404`.

- **PUT /changePassword/:id**
  - Description: Change password. Body must include `oldPassword` and `newPassword`.
  - Request body:
    ```json
    { "oldPassword":"old", "newPassword":"new" }
    ```
  - Response: `200` on success; `401` if old password doesn't match; `404` if user not found.

- **GET /customer/:id**
  - Description: Get customer details by id.
  - Response: `200` with customer or `404`.

- **GET /customerbyName/:name**
  - Description: Find a customer by name. Returns `{ message, user }` where `user` is the customer document or `null`.

- **GET /allcustomers**
  - Description: Return all users with `role: 'customer'`.

## Transactions

- **POST /transaction**
  - Description: Transfer funds from `senderId` to `receiverId`. Validates sender password and balance, updates both accounts, saves a `Transaction` record, and triggers an email to sender.
  - Request body:
    ```json
    { "senderId":"<id>", "receiverId":"<id>", "amount":123, "password":"senderPassword" }
    ```
  - Responses:
    - `200` with `{ message: 'Transaction successful', transaction }`
    - `404` if sender/receiver not found
    - `401` if password invalid
    - `400` if insufficient balance

- **GET /spendings/:id**
  - Description: Get transactions where `senderId` equals `id`.
  - Response: `200` with array of transactions.

- **GET /earnings/:id**
  - Description: Get transactions where `receiverId` equals `id`.

- **GET /transactions**
  - Description: Get all transactions.

---

## Models (reference)
- Branch model: `jpmcbank/models/branch.js` — branchName, branchAddress, etc.
- Customer model: `jpmcbank/models/customers.js` — name, email, mobile, password (bcrypt-hashed), role (`customer`|`employee`), branch (ObjectId), availableBalance, etc.
- Transaction model: `jpmcbank/models/transaction.js` — senderId, receiverId, amount, timestamps.

## Run with Docker Compose
From the repository root run:
```bash
docker compose up --build
```
This starts `mongo`, the backend (mapped to host port `4300`) and the frontend (nginx on host port `4200`).

If you prefer to run the backend manually for development:
```bash
cd jpmcbank
npm install
PORT=4300 MONGO_URI="mongodb://localhost:27017/jpmcbank" npm start
```

---

If you'd like, I can add example cURL commands for each endpoint or generate a Postman collection next.
