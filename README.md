# LinkShelf

A tidy, local bookmark manager. Save links with folders, tags and notes, then find them with fast search and filters.

## Features

- **Add links** with URL validation (http/https only), folder, tags and a note
- **Folders and tag filters**, full-text search and three sort orders
- **Open, copy, edit, favourite and delete** actions on every card
- **Visit counts** tracked locally
- **Import / Export JSON** for backup or migration
- **Dark mode**, responsive card grid and local autosave

## Run it

```bash
# open index.html directly, or
python3 -m http.server 8000  # then visit http://localhost:8000
```

## Privacy

LinkShelf has no backend and no analytics. Your shelf is stored in `localStorage` under `linkshelf:v1` and never leaves the device.

## Stack

HTML5, CSS custom properties and vanilla JavaScript. No dependencies or API keys.

## License

MIT — see [LICENSE](LICENSE).
