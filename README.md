# Roger Nicholas portfolio

Plain static site, no build step. Open `index.html` in a browser, or serve the folder with GitHub Pages.

- `index.html`: paper landing page you can paint on; the name and "Enter" lead to the home page.
- `home.html`: about, carousel of paintings, projects, contact, and the full menu.
- `assets/style.css`, `assets/paint.js` (brush), `assets/home.js` (menu and carousel arrows).
- `images/`: put painting photos and the portrait here.

## Filling in placeholders

Anything still needing real content is marked with a dashed blue underline and square brackets, like `[Title]` or `[your email]`.

To add a painting, copy one `<figure class="print">` in `home.html` and replace
`<div class="ph-label label">[Painting photo]</div>` with
`<img src="images/your-file.jpg" alt="Short description">`.
