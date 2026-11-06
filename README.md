# Pedson Tayebwa – Portfolio Website

Static website (HTML, CSS, JavaScript) plus a small Node.js/Express backend that
emails you whatever visitors send through the contact form.

```
portfolio-site/
├── public/            <- the website itself
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── photo.jpg
├── server.js          <- backend: serves the site + POST /api/contact
├── package.json
├── .env.example       <- copy to .env and fill in
└── .gitignore
```

## 1. Run it on your computer
1. Install Node.js 18+ from https://nodejs.org
2. In this folder run: `npm install`
3. Create the Gmail App Password (Google Account > Security > 2-Step Verification
   must be ON > App passwords > create one named "portfolio").
4. Copy `.env.example` to `.env` and fill in EMAIL_USER, EMAIL_PASS, EMAIL_TO.
5. Run `npm start` and open http://localhost:3000
6. Send yourself a test message through the form.

## 2. Put it on GitHub
```
git init
git add .
git commit -m "Portfolio website"
git branch -M main
git remote add origin https://github.com/pedson322/portfolio.git
git push -u origin main
```
(.env is in .gitignore, so your password is never uploaded.)

## 3. Deploy to the web (free) with Render
1. Go to https://render.com and sign in with GitHub.
2. New > Web Service > choose the `portfolio` repo.
3. Runtime: Node. Build command: `npm install`. Start command: `npm start`.
4. Under Environment, add EMAIL_USER, EMAIL_PASS and EMAIL_TO (same values as .env).
5. Deploy. You get a public address like https://portfolio-xxxx.onrender.com.
   The free plan sleeps when idle, so the first visit can take ~30 seconds.

Because the same server serves the site and the API, the form works with no
extra configuration.

## Option: free static hosting + separate backend
Host only `public/` on GitHub Pages or Netlify, and the backend on Render.
Then in `public/script.js` set `API_URL` to your Render address, and in Render add
`ALLOWED_ORIGIN=https://pedson322.github.io` (your static site address).
(You would also need to add your Render address to connectSrc in server.js's
helmet settings only if you serve pages from the backend; static hosts are unaffected.)

## Updating the site later
- New project: copy a `<div class="empty">` replacement into the Projects section
  of `public/index.html` (see the Experience list for a pattern to copy).
- New certificate: add one `<li>` to the Credentials `<ul class="rows">`.
- Then `git add . && git commit -m "Update" && git push` and Render redeploys itself.
