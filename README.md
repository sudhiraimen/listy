# Listy

A small installable web app (PWA) for keeping lists of movies, TV shows, games, books, albums and anime. Covers are found automatically when you add something.

## Put it online

A PWA has to be served over HTTPS to install. Any static host works:

- **Netlify Drop**: go to app.netlify.com/drop and drag this whole folder onto the page.
- **GitHub Pages**: push the folder to a repo, then Settings → Pages → deploy from the main branch.
- **Cloudflare Pages / Vercel**: create a project from the folder, no build step.

Then open the link on your phone:
- **iPhone (Safari)**: Share → Add to Home Screen.
- **Android (Chrome)**: menu → Install app.

To try it on your computer first, run `python3 -m http.server` in this folder and open http://localhost:8000.

## Where covers come from

No API keys needed. Each category searches a free source, falling back to Wikipedia if that comes up empty.

| Category | Source |
| --- | --- |
| Movies | iTunes Search |
| TV shows | TVmaze |
| Games | Wikipedia (then App Store) |
| Books | Open Library |
| Albums | iTunes Search |
| Anime | Jikan (MyAnimeList) |
| Other | Wikipedia |

### Pasting a link

Paste a link into the search box (or use **Paste a link** under Change cover) and Listy pulls the cover from that page. It also shows other covers for the same title, in case the page's image isn't a poster.

- IMDb, Wikipedia, Steam, TVmaze, MyAnimeList, Open Library and Apple links are read through those sites' own free APIs.
- Any other site (Letterboxd, Goodreads, Backloggd, stores…) is read through Microlink, which finds the page's preview image. Its free tier allows about 50 links a day; if it's unavailable, a public proxy (allorigins) is tried.
- A direct image link (ending in .jpg, .png, .webp…) is used as is.

You can also upload your own photo from an item's detail screen.

## Your data

Lists are saved on the device (browser storage), so they don't sync between devices. Use the ••• menu on the Lists screen to export a backup file and import it elsewhere.

## Files

- `index.html` – the whole app
- `sw.js` – offline support and cover caching (bump `SHELL_CACHE` when you change the app so phones pick up the update)
- `manifest.webmanifest` + `icons/` – install name and home-screen icon
