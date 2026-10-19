# Roger Nicholas portfolio

Plain static site, no build step. Served by GitHub Pages straight from `main`.

- `index.html`: paper landing page you can paint on; clicking the name opens the home page.
- `home.html`: bio, drifting carousel of work, projects, contact, full menu.
- `project.html#<slug>`: one project expanded (e.g. `project.html#judafest`).
- `content/projects.json`: all project text and images. Edit this to change projects.
- `images/`: upload photos here.
- `assets/`: styles and scripts.

## Editing projects

Each project in `content/projects.json` has:

- `slug`: the short name used in its link (lowercase, dashes, no spaces)
- `title`, `year`, `kind`, `summary` (shown on the home page)
- `body`: list of paragraphs shown on the project page
- `images`: the images shown on the project page, each with an optional `caption`. The first one to three also appear side by side on the home page, so put your favourites first.

For an image, set `src` to its path, e.g. `"images/judafest-1.jpg"`, write a short `alt` description, and set `ratio` to its width / height, e.g. `"3 / 2"`. While `src` is empty, a coloured placeholder shows instead.

The order of projects in the file is the order on the site. If you add a project, also add its link to the Projects column of the menu in `home.html` and `project.html`.

## Editing the carousel

The carousel lives in `home.html` inside `<div class="belt">`. Copy a `<figure>`, set `--ratio`, and swap the placeholder span for `<img src="images/..." alt="...">`.

Anything still needing real content is shown in square brackets with a dashed blue underline.
