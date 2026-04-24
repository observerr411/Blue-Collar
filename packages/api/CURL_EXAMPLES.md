# BlueCollar API cURL Examples

This guide provides practical cURL examples for BlueCollar API endpoints.

Base URL used below:

```bash
export API_BASE_URL="http://localhost:3000/api"
```

Reusable tokens:

```bash
export USER_TOKEN="<user-jwt>"
export CURATOR_TOKEN="<curator-jwt>"
export ADMIN_TOKEN="<admin-jwt>"
```

## 1. Health

```bash
curl -s http://localhost:3000/health
```

## 2. Auth Endpoints

## 2.1 Register

```bash
curl -X POST "$API_BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ada",
    "lastName": "Lovelace",
    "email": "ada@example.com",
    "password": "Password123!"
  }'
```

## 2.2 Login

```bash
curl -X POST "$API_BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ada@example.com",
    "password": "Password123!"
  }'
```

## 2.3 Get Current User

```bash
curl "$API_BASE_URL/auth/me" \
  -H "Authorization: Bearer $USER_TOKEN"
```

## 2.4 Verify Account

By token in request body:

```bash
curl -X PUT "$API_BASE_URL/auth/verify-account" \
  -H "Content-Type: application/json" \
  -d '{"token":"<verification-token>"}'
```

By token in query:

```bash
curl -X PUT "$API_BASE_URL/auth/verify-account?token=<verification-token>"
```

## 2.5 Forgot Password

```bash
curl -X POST "$API_BASE_URL/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com"}'
```

## 2.6 Reset Password

```bash
curl -X PUT "$API_BASE_URL/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "token":"<reset-token>",
    "password":"NewPassword123!"
  }'
```

## 2.7 Logout

```bash
curl -X DELETE "$API_BASE_URL/auth/logout" \
  -H "Authorization: Bearer $USER_TOKEN"
```

## 2.8 Google OAuth (redirect flow)

Get redirect response headers:

```bash
curl -i "$API_BASE_URL/auth/google"
```

Callback endpoint (normally invoked by Google):

```bash
curl -i "$API_BASE_URL/auth/google/callback?code=<google-oauth-code>"
```

## 3. Category Endpoints

List categories:

```bash
curl "$API_BASE_URL/categories"
```

Get a category:

```bash
curl "$API_BASE_URL/categories/<category-id>"
```

## 4. Worker Endpoints

## 4.1 Public Listing (Pagination + Filtering)

Basic pagination:

```bash
curl "$API_BASE_URL/workers?page=1&limit=20"
```

Filter by category and search:

```bash
curl "$API_BASE_URL/workers?category=<category-id>&search=plumber"
```

Filter by location:

```bash
curl "$API_BASE_URL/workers?city=Lagos&state=Lagos&country=NG"
```

## 4.2 Get Worker

```bash
curl "$API_BASE_URL/workers/<worker-id>"
```

## 4.3 Curator/Admin: My Workers

```bash
curl "$API_BASE_URL/workers/mine?page=1&limit=10" \
  -H "Authorization: Bearer $CURATOR_TOKEN"
```

## 4.4 Create Worker (Curator role)

```bash
curl -X POST "$API_BASE_URL/workers" \
  -H "Authorization: Bearer $CURATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Jane Electric",
    "bio":"12 years field experience",
    "phone":"+2348012345678",
    "email":"jane.electric@example.com",
    "walletAddress":"GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "categoryId":"<category-id>"
  }'
```

## 4.5 Update Worker (Curator role)

JSON update:

```bash
curl -X PUT "$API_BASE_URL/workers/<worker-id>" \
  -H "Authorization: Bearer $CURATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Electric Pro"}'
```

Multipart update via method override:

```bash
curl -X POST "$API_BASE_URL/workers/<worker-id>" \
  -H "Authorization: Bearer $CURATOR_TOKEN" \
  -H "X-HTTP-Method: PUT" \
  -F "name=Jane Electric Pro" \
  -F "avatar=@/path/to/avatar.jpg"
```

## 4.6 Delete Worker (Curator role)

```bash
curl -X DELETE "$API_BASE_URL/workers/<worker-id>" \
  -H "Authorization: Bearer $CURATOR_TOKEN"
```

## 4.7 Toggle Worker Active State (Curator role)

```bash
curl -X PATCH "$API_BASE_URL/workers/<worker-id>/toggle" \
  -H "Authorization: Bearer $CURATOR_TOKEN"
```

## 4.8 Availability

Get availability:

```bash
curl "$API_BASE_URL/workers/<worker-id>/availability"
```

Upsert availability:

```bash
curl -X PUT "$API_BASE_URL/workers/<worker-id>/availability" \
  -H "Authorization: Bearer $CURATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "weeklySchedule": {
      "monday": [{"start":"09:00","end":"17:00"}],
      "tuesday": [{"start":"09:00","end":"17:00"}]
    }
  }'
```

## 4.9 On-chain Registration (Curator role)

```bash
curl -X POST "$API_BASE_URL/workers/<worker-id>/register-on-chain" \
  -H "Authorization: Bearer $CURATOR_TOKEN"
```

## 4.10 Contact Requests

Create contact request (authenticated user):

```bash
curl -X POST "$API_BASE_URL/workers/<worker-id>/contact" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message":"Need urgent wiring repair",
    "preferredContact":"email"
  }'
```

List worker contact requests (curator):

```bash
curl "$API_BASE_URL/workers/<worker-id>/contacts" \
  -H "Authorization: Bearer $CURATOR_TOKEN"
```

Update contact request status (curator):

```bash
curl -X PATCH "$API_BASE_URL/workers/<worker-id>/contacts/<request-id>" \
  -H "Authorization: Bearer $CURATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted"}'
```

## 4.11 Bookmarks

Toggle bookmark:

```bash
curl -X POST "$API_BASE_URL/workers/<worker-id>/bookmark" \
  -H "Authorization: Bearer $USER_TOKEN"
```

List my bookmarks:

```bash
curl "$API_BASE_URL/users/me/bookmarks" \
  -H "Authorization: Bearer $USER_TOKEN"
```

## 4.12 Reviews

List reviews:

```bash
curl "$API_BASE_URL/workers/<worker-id>/reviews"
```

Create review:

```bash
curl -X POST "$API_BASE_URL/workers/<worker-id>/reviews" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Great work and on time"
  }'
```

## 5. User Endpoints

Save push subscription:

```bash
curl -X POST "$API_BASE_URL/users/me/push-subscription" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint":"https://fcm.googleapis.com/fcm/send/abc",
    "keys": {"p256dh":"<key>", "auth":"<auth>"}
  }'
```

Delete push subscription:

```bash
curl -X DELETE "$API_BASE_URL/users/me/push-subscription" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"https://fcm.googleapis.com/fcm/send/abc"}'
```

## 6. Admin Endpoints

Admin stats:

```bash
curl "$API_BASE_URL/admin/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Paginated workers (admin):

```bash
curl "$API_BASE_URL/admin/workers?page=1&limit=25" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Paginated users (admin):

```bash
curl "$API_BASE_URL/admin/users?page=1&limit=25" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 7. Role-based Scenario Examples

## 7.1 Plain user attempts worker creation (expected 403)

```bash
curl -i -X POST "$API_BASE_URL/workers" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Unauthorized Worker","categoryId":"<category-id>"}'
```

Expected error envelope:

```json
{
  "status": "error",
  "message": "Forbidden",
  "code": 403
}
```

## 7.2 Missing JWT (expected 401)

```bash
curl -i "$API_BASE_URL/auth/me"
```

Expected:

```json
{
  "status": "error",
  "message": "Unauthorized",
  "code": 401
}
```

## 8. Common Error Response Examples

## 8.1 Validation error (400)

```bash
curl -i -X POST "$API_BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"short"}'
```

## 8.2 Resource not found (404)

```bash
curl -i "$API_BASE_URL/workers/non-existent-id"
```

Common envelope:

```json
{
  "status": "error",
  "message": "Worker not found",
  "code": 404
}
```

## 8.3 Internal error (500)

All unexpected server failures follow this envelope:

```json
{
  "status": "error",
  "message": "Internal server error",
  "code": 500
}
```

## 9. Rate Limiting Behavior

The project includes an auth rate-limiter configuration in `src/config/rateLimiter.ts` with defaults:

- window: 15 minutes (`900000` ms)
- max: 10 requests per IP
- response code: `429`

Example 429 envelope:

```json
{
  "status": "error",
  "message": "Too many requests from this IP, please try again later.",
  "code": 429
}
```

Load test example (for auth endpoints where limiter is enabled):

```bash
for i in $(seq 1 15); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST "$API_BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"ada@example.com","password":"wrong-password"}'
done
```

Inspect standard rate-limit headers:

```bash
curl -i -X POST "$API_BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"wrong-password"}'
```
