# Page body content

Paste-ready text for the pages in step 6. Each file is the **body** only —
open the page in Shopify, click the `<>` (Show HTML) button in the editor
toolbar, and paste the whole file in.

Pasting as HTML rather than typing into the visual editor keeps the headings
as real headings, which is what the theme styles and what search engines read.

| File | Page |
|---|---|
| `about.html` | About |

Size chart, Contact and Policies take **no body content** — their pages are
built by the theme, so leave those editors empty.

## What is already handled, and must not be pasted twice

The About page's opening and closing come from the theme, not the body, so
they are deliberately absent from `about.html`:

| Part | Where it lives |
|---|---|
| The crest image | The theme |
| "Our story" eyebrow | Theme editor → About section → Eyebrow |
| "A word that had to become a coat" | Theme editor → About section → Heading |
| The حَنان lede paragraph | Theme editor → About section → Arabic word, Lede |
| "HANAN / Modesty, thoughtfully designed for motherhood." | Theme editor → About section → Sign-off |
| "— Salihah Imtiaz Patel, founder" | Theme editor → About section → Attribution |

Those already carry the right wording as defaults, so the About page reads
correctly the moment the body is pasted in. Change them under
**Online Store → Themes → Customise**, with the About page open.

## No inline styles

The single-page original spaced its headings with inline `style` attributes.
Those are gone here: Shopify's editor strips them, and the theme now styles
page bodies through an `.rte` class instead. Keep pasted content plain — the
stylesheet handles how it looks.
