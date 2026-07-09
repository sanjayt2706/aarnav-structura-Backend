# Aarnav Structura — API Documentation

Base URL (dev): `http://localhost:5000`

All responses use the envelope `{ success: boolean, message?, data?, errors? }`.
Admin routes require header: `Authorization: Bearer <token>` (from `/api/auth/login`).

---

## Auth

| Method | Endpoint | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/api/auth/login` | — | `{ email, password }` | Returns `{ token, admin }` |
| GET | `/api/auth/me` | ✅ | — | Current admin profile |
| POST | `/api/auth/logout` | ✅ | — | Audit-logged only (JWT is stateless) |
| POST | `/api/auth/change-password` | ✅ | `{ currentPassword, newPassword }` | |
| POST | `/api/auth/forgot-password` | — | `{ email }` | Sends reset email if account exists |
| POST | `/api/auth/reset-password` | — | `{ token, newPassword }` | Token from email link, 1hr expiry |

## Public — Website

| Method | Endpoint | Notes |
|---|---|---|
| POST | `/api/enquiry` | Contact form submit. Rate-limited to 10/15min/IP. Body: `fullName, phoneNumber, email?, location?, projectType?, budget?, projectBrief?` |
| POST | `/api/track/pageview` | Body: `{ page, referrer? }`. Called on every SPA route change. |
| GET | `/api/settings` | All CMS settings as `{ hero, about, contact_info, social_links, footer }` |
| GET | `/api/settings/:key` | One setting block |
| GET | `/api/projects` \| `/api/gallery` \| `/api/services` \| `/api/testimonials` \| `/api/team` | List published content |
| GET | `/api/projects/:id` (etc.) | Single item |

## Admin — Enquiries (`/api/admin/enquiries`)

| Method | Endpoint | Query/Body |
|---|---|---|
| GET | `/` | `?page&limit&search&status&projectType&dateFrom&dateTo&sortBy&sortDir` |
| GET | `/:id` | |
| PATCH | `/:id/status` | `{ status, adminNotes? }` |
| DELETE | `/:id` | |
| DELETE | `/bulk` | `{ ids: [1,2,3] }` |
| PATCH | `/bulk/status` | `{ ids: [...], status }` |
| GET | `/export/csv` | Same filters as list |
| GET | `/export/excel` | Same filters as list |

Statuses: `New, Contacted, Meeting Scheduled, Quotation Sent, Won, Lost, Completed`

## Admin — Visitors (`/api/admin/visitors`)

| Method | Endpoint | Query |
|---|---|---|
| GET | `/` | `?page&limit&search&country&device&browser&dateFrom&dateTo` |
| GET | `/export/csv` \| `/export/excel` | Same filters |

## Admin — Dashboard (`/api/admin/dashboard`)

| Method | Endpoint | Returns |
|---|---|---|
| GET | `/overview` | Card totals: visitors (total/today/week/month), enquiries (total/today/pending/completed), conversion rate |
| GET | `/charts?days=30` | Daily visitors, enquiry trend, visitor-vs-enquiry combined series, traffic sources, device + browser distribution |

## Admin — Content management

All of these share the same base path as the public GET (e.g. `/api/projects`) but POST/PUT/DELETE require `Authorization`. Uploads use `multipart/form-data` with the file field named as noted.

| Resource | Path | File field |
|---|---|---|
| Projects | `/api/projects` | `cover_image` |
| Gallery | `/api/gallery` | `image_url` |
| Services | `/api/services` | `image` |
| Testimonials | `/api/testimonials` | `avatar` |
| Team | `/api/team` | `photo` |

Example: `POST /api/projects` (form-data: title, category, location, year, area_sqft, description, is_featured, display_order, status, cover_image=<file>)

## Admin — Settings (`/api/admin/settings/:key`)

`PUT /api/admin/settings/hero` with JSON body — upserts that CMS block. Keys used by the frontend: `hero`, `about`, `contact_info`, `social_links`, `footer`.

---

## Error codes

| Status | Meaning |
|---|---|
| 401 | Missing/invalid/expired token |
| 403 | Authenticated but role not permitted |
| 404 | Resource not found |
| 422 | Validation failed (`errors` array in response) |
| 429 | Rate limited (enquiry submission) |
| 500 | Server error |
