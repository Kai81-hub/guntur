# Guntur Properties

A frontend + Supabase + Cloudinary real estate and property services platform for Guntur.

## Tech Stack

- HTML
- CSS
- JavaScript
- Supabase for database/auth-like phone role flow/chats/leads/analytics
- Cloudinary for photos and videos
- SEO files: robots.txt, sitemap.xml, schema.json

## Folder Structure

```txt
guntur-properties/
├── index.html
├── properties.html
├── property-details.html
├── services.html
├── services-details.html
├── contact.html
├── about-us.html
├── login.html
├── register.html
│
├── admin-panel.html
├── staff-panel.html
├── user-panel.html
├── owner-panel.html
├── broker-panel.html
├── developer-panel.html
│
├── css/
├── js/
├── assets/
├── database/
├── seo/
└── README.md
```

## Important Concept

```txt
assets folder = default website files
Supabase = changeable dynamic data
Cloudinary = uploaded photos/videos
```

## Dynamic Image/Video Flow

```txt
Admin/Owner/Broker/Developer uploads media
↓
Cloudinary stores the file
↓
Cloudinary URL is saved in Supabase
↓
Website reads URL from Supabase
↓
Website displays image/video
```

## No Approval System

Property uploads go live directly.

```txt
properties.status = active
```

Status values:

```txt
active
inactive
sold
rented
draft
```

Admin/staff can later hide property by changing:

```txt
status = inactive
```

## Analytics Needed

Staff/Admin can see:

- What users searched
- Property views
- Property contacts
- Property ID
- Visitor phone/name
- Role-wise registered users

Owner/Broker/Developer can see only their own:

- My property views
- My property contacts
- My property chats
- Which property ID was contacted
- Search keyword if user came from search
- Date/time

## Supabase Tables

Run these SQL files in Supabase SQL Editor in this order:

1. `database/tables.sql`
2. `database/policies.sql`
3. `database/sample-data.sql`
4. `database/storage-policies.sql` only if using Supabase Storage

## Cloudinary

Use Cloudinary for:

- property images
- banners
- about/contact images
- videos
- optional selfie verification

Save Cloudinary URLs in Supabase tables:

```txt
property_images.image_url
home_banners.image_url
page_media.media_url
profiles.selfie_url
```

## SEO Deployment

Copy these files to website root when deploying:

```txt
seo/robots.txt → robots.txt
seo/sitemap.xml → sitemap.xml
seo/schema.json → schema.json
```

Then submit sitemap in Google Search Console:

```txt
https://www.gunturproperties.in/sitemap.xml
```

## Supabase Config

Edit:

```txt
js/config.js
```

Add:

```js
SUPABASE_URL: "your-url",
SUPABASE_ANON_KEY: "your-anon-key"
```
