# Roger Nicholas portfolio

A plain static site with no build step. GitHub Pages serves it straight from `main`, and every change shows up on the live site a minute or two after it's committed.

## Pages

- `index.html`: the paper landing page you can paint on. Clicking the name opens the home page.
- `home.html`: bio, drifting carousel, projects and contact.
- `project.html#<slug>`: one project expanded, for example `project.html#judafest`.
- `cv.html`: your CV. Edit the entries in the file directly: each line is a year, a title and a place or detail.
- `404.html`: shown for broken links.

## Where the content lives

| What | Where |
| --- | --- |
| Bio | the two paragraphs in `home.html`, marked with a comment |
| Carousel | the `images/carousel/` folder, listed in `content/work.json` |
| Projects (home grid, project pages, menu list) | `content/projects.json` |
| Photos | the `images/` folder |
| Email, Instagram, footer line | header and footer of `home.html`, `project.html`, `cv.html` and `404.html` |

Anything still waiting for real content shows in square brackets with a dashed blue underline, like `[Title]`.

### Images

Every image, in either file, has the same fields:

- `src`: the path to the file, e.g. `"images/painting/bathers.jpg"`. Project images are sorted into `images/painting`, `images/film` and `images/web`; the carousel has its own `images/carousel`. Leave it empty to show a tinted placeholder.
- `alt`: a short description for screen readers and search engines.
- `ratio`: the image's width / height, e.g. `"1600 / 1200"` (the pixel size works) or `"4 / 5"`. This sets the shape before the image loads, so get it close to the real file.
- `tone`: the placeholder colour, which you can drop once `src` is set.
- `label`: the placeholder text, which you can drop once `src` is set.

Export images as JPG or WebP, about 2000 px on the long edge and under 500 KB each, so the site stays quick on phones. Use lowercase file names with dashes and no spaces.

### Carousel: `images/carousel/` and `content/work.json`

The carousel shows the images in `images/carousel/`, in the order they're listed in `content/work.json`. To change it, put the image in that folder and add, remove or reorder its entry in `works`:

```json
{
  "src": "images/carousel/bathers.jpg",
  "alt": "Bathers",
  "ratio": "1400 / 1050",
  "title": "Bathers",
  "caption": "oil on canvas, 2026"
}
```

`title` and `caption` are shown underneath as one line: "Bathers, oil on canvas, 2026". `ratio` can be left out and the carousel takes the shape from the file, but with it the carousel doesn't shift as images load. About 1400 px on the long edge is plenty here. An image removed from `work.json` can be deleted from the folder too.

### Projects: `content/projects.json`

Each project has:

- `slug`: the short name used in its link, lowercase with dashes (e.g. `good-night-sleep-tight`). Change it and old links stop working.
- `title`, `year`, `summary`: shown on the home page and at the top of the project page. `year` can be a range (`2023 – 2026`), words such as `Coming soon`, or left empty.
- `field`: `Painting`, `Film` or `Web`. This is what the filters above the projects and the Fields in the menu use.
- `kind`: a short description shown on the project page next to the year and field (e.g. `Feature · In development`).
- `body`: a list of paragraphs for the project page.
- `tech`: optional, a line such as `HTML · CSS · JavaScript`, shown under the text.
- `links`: optional buttons under the text, each `{ "label": "Watch on ČT art", "url": "https://…" }`. A file in `files/` works too, like the portfolio PDF.
- `video`: optional, a Vimeo film: `{ "vimeo": "488553290", "hash": "9ac8508919" }`, or a YouTube one: `{ "youtube": "ltixZSinPek" }` (the part after `v=` in the link). Both are in Vimeo's embed code: `player.vimeo.com/video/488553290?h=9ac8508919`. A public video doesn't need `hash`. The Vimeo player is shown above the project's images.
- `images`: all images for the project page, each with an optional `caption`. The first one is the project's image on the home page, so put the strongest first. A project with no images is listed as a single line under the image rows.

Projects are shown newest first by the latest year in `year`. A `year` in words (`Coming soon`) goes first; projects without a year come last, in file order.

## Code

- `assets/style.css`: all styles. Colours, fonts, type sizes and spacing are tokens at the top.
- `assets/site.js`: shared helpers and the menu.
- `assets/carousel.js`: renders and animates the carousel.
- `assets/projects.js`: renders the projects grid, the project page and the menu list.
- `assets/paint.js`: the paint brush on the landing page.

To preview locally, run `python3 -m http.server` in this folder and open http://localhost:8000. Opening the files directly from disk won't load the content files.
