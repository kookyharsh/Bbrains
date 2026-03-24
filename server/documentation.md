# Learnytics API Documentation

This version of the documentation includes the common error messages returned by the backend to assist with debugging and frontend validation.

## Base Configuration

* **Base URL:** `http://localhost:5000`
* **Authentication:** Most routes require a valid JWT token in an HTTP-only cookie named `token`.

---

## 1. Authentication

**Base Prefix:** `/`

| Endpoint | Method | Parameters | Success Output | Possible Error Messages |
| --- | --- | --- | --- | --- |
| `/register` | POST | **Body:** `username`, `email`, `password`, `confirmpassword` | `{ "status": "success", "message": "User created" }` | "All fields are required", "Passwords do not match", "User already exists", "Registration failed" |
| `/login` | POST | **Body:** `email`, `password` | `{ "status": "success", "message": "Login successful", ... }` | "Email and password required", "User not found", "Invalid credentials", "Login failed" |
| `/logout` | POST | None | `{ "status": "success", "message": "Logged out..." }` | N/A |

---

## 2. Dashboard

**Base Prefix:** `/`

| Endpoint | Method | Success Output | Possible Error Messages |
| --- | --- | --- | --- |
| `/dashboard` | GET | `{ "status": "success", "data": { ... } }` | "Unauthorized", "User not found", "Failed to fetch user data" |

---

## 3. User Management & Actions

**Base Prefix:** `/user`

| Endpoint | Method | Parameters | Success Output | Possible Error Messages |
| --- | --- | --- | --- | --- |
| `/update/:id` | PUT | **URL:** `id`; **Body:** fields | `{ "status": "success", "user": { ... } }` | "Failed to update user" |
| `/delete/:id` | DELETE | **URL:** `id` | `{ "status": "success", "message": "User deleted..." }` | "Failed to delete user" |
| `/claim-daily` | POST | None | `{ "status": "success", "rewards": { ... } }` | "Daily reward already claimed in the last 24 hours" |
| `/search` | GET | **Query:** `name` | `{ "status": "success", "user": { ... } }` | "Name required", "User not found" |
| `/:username` | GET | **URL:** `username` | `{ "status": "success", "user": { ... } }` | "Name required", "User not found" |

---

## 4. Academic System

**Base Prefix:** `/academic`

| Endpoint | Method | Parameters | Success Output | Possible Error Messages |
| --- | --- | --- | --- | --- |
| `/assignments` | POST | **Body:** `title`, `description`, `courseId`, `dueDate` | `{ "status": "success", "assignment": { ... } }` | "Academic Error", message from service |
| `/assignments/:id/submit` | POST | **URL:** `id`; **Body:** `filePath` | `{ "status": "success", "submission": { ... } }` | Catch-all error with message |
| `/announcements/:id` | DELETE | **URL:** `id` | `{ "status": "success", "message": "Deleted..." }` | Catch-all error with message |

---

## 5. Marketplace

**Base Prefix:** `/market`

| Endpoint | Method | Parameters | Success Output | Possible Error Messages |
| --- | --- | --- | --- | --- |
| `/` | GET | **Query:** `page`, `limit` | `{ "status": "success", "products": [ ... ] }` | "Failed to fetch products" |
| `/cart/add` | POST | **Body:** `productId`, `quantity` | `{ "status": "success", "cartItem": { ... } }` | "Product not found", "Insufficient stock" |
| `/cart/remove/:id` | DELETE | **URL:** `id` | `{ "status": "success", "message": "Removed..." }` | "Cart item not found or unauthorized" |
| `/checkout` | POST | **Body:** `pin` | `{ "status": "success", "order": { ... } }` | "Wallet PIN required", "Wallet not configured", "Invalid Wallet PIN", "Cart is empty", "Insufficient wallet balance" |

---

## 6. Wallet & Transactions

**Base Prefix:** `/wallet`

| Endpoint | Method | Parameters | Success Output | Possible Error Messages |
| --- | --- | --- | --- | --- |
| `/transfer` | POST | **Body:** `recipientWalletId`, `amount`, `pin` | `{ "status": "success", "transactions": { ... } }` | "Sender wallet not found", "Invalid PIN", "Insufficient balance", "Recipient wallet not found", "Cannot send to self" |
| `/history` | GET | None | `{ "status": "success", "history": [ ... ] }` | Catch-all error with message |

---

## 7. Logs

**Base Prefix:** `/logs`

| Endpoint | Method | Success Output | Possible Error Messages |
| --- | --- | --- | --- |
| `/` | GET | `{ "status": "success", "logs": [ ... ] }` | Catch-all error with message |