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
| Carousel | `content/work.json` |
| Projects (home grid, project pages, menu list) | `content/projects.json` |
| Photos | the `images/` folder |
| Email, Instagram, footer line | header and footer of `home.html`, `project.html` and `404.html` |

Anything still waiting for real content shows in square brackets with a dashed blue underline, like `[Title]`.

### Images

Every image, in either file, has the same fields:

- `src`: the path to the file, e.g. `"images/judafest-1.jpg"`. Leave it empty to show a tinted placeholder.
- `alt`: a short description for screen readers and search engines.
- `ratio`: the image's width / height, e.g. `"3 / 2"` for landscape or `"4 / 5"` for portrait. This sets the shape before the image loads, so get it close to the real file.
- `tone`: the placeholder colour, which you can drop once `src` is set.
- `label`: the placeholder text, which you can drop once `src` is set.

Export images as JPG or WebP, about 2000 px on the long edge and under 500 KB each, so the site stays quick on phones. Use lowercase file names with dashes and no spaces.

### Carousel: `content/work.json`

Each entry in `works` is one image with `title` and `caption`, shown underneath as one line: "Title, caption". The order in the file is the order on the page.

### Projects: `content/projects.json`

Each project has:

- `slug`: the short name used in its link, lowercase with dashes (e.g. `mexico-series`). Change it and old links stop working.
- `title`, `year`, `summary`: shown on the home page and at the top of the project page.
- `field`: `Painting`, `Film` or `Web`. This is what the filters above the projects and the Fields in the menu use.
- `kind`: a short description shown on the project page next to the year and field (e.g. `Feature · In development`).
- `body`: a list of paragraphs for the project page.
- `images`: all images for the project page, each with an optional `caption`. The first one is the project's image on the home page, so put the strongest first.

Projects are shown newest first by `year`; projects without a number for the year (e.g. `Ongoing`) come last, in file order.

## Code

- `assets/style.css`: all styles. Colours, fonts, type sizes and spacing are tokens at the top.
- `assets/site.js`: shared helpers and the menu.
- `assets/carousel.js`: renders and animates the carousel.
- `assets/projects.js`: renders the projects grid, the project page and the menu list.
- `assets/paint.js`: the paint brush on the landing page.

To preview locally, run `python3 -m http.server` in this folder and open http://localhost:8000. Opening the files directly from disk won't load the content files.
