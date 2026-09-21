# HANAN on Shopify

Everything needed to move the site from Cloudflare Workers to a Shopify
store: the design as a real Shopify theme, the catalogue as an import, and
the policy texts ready to paste.

Nothing here is live and nothing here charges anyone money yet. The order
below is the order to do it in — products before theme, because the theme
renders real products.

```
shopify/
├── theme/              the site rebuilt as a Shopify theme
├── make-theme-zip.sh   packs theme/ for Shopify's zip upload
├── content/            paste-ready page bodies
├── products.csv        12 colourways × 4 sizes = 48 variants
└── policies/           delivery, returns and privacy, ready to paste
```

---

## 1. Pick a plan

You said you were on a trial or undecided. For this shop:

| Plan | Monthly (billed yearly) | Card fee, UK cards | Worth it when |
|---|---|---|---|
| **Basic** | ~£25 | ~1.7% + 0p | **Start here.** Everything this theme needs. |
| Grow | ~£65 | ~1.6% + 0p | Several staff accounts, or lower card fees start to outweigh the jump. |
| Advanced | ~£344 | ~1.4% + 0p | Not for a while. |

Two things that actually matter more than the plan:

- **Use Shopify Payments.** Any other gateway adds a third-party transaction
  fee (2% on Basic) *on top of* the card fee. Shopify Payments has none.
- **Check the current prices before committing.** Shopify runs trial offers
  and changes pricing; the figures above are a guide, not a quote.

Basic at ~£25/month against a £75 abaya means roughly one sale a month
covers the platform. That is the number to hold onto.

## 2. Create the metafield definitions

**Do this before importing, or the swatches and the product accordions come
up empty.**

**Settings → Custom data → Products → Add definition.**

Not Content → Metaobjects. Those are a different feature — metaobjects are
standalone records you define from scratch, metafields are extra fields added
to something that already exists, which is what the products need. If you find
yourself on a Metaobjects screen, you are in the wrong place.

For each one below, set the namespace to `custom`, and the key and type
exactly as listed:

| Key | Type |
|---|---|
| `style_group` | Single line text |
| `style_name` | Single line text |
| `colour_name` | Single line text |
| `colour_code` | Single line text |
| `swatch_hex` | Single line text |
| `colour_note` | Multi-line text |
| `intro` | Multi-line text |
| `fabric` | Single line text |
| `care` | Multi-line text |
| `fit` | Multi-line text |
| `nursing_access` | Multi-line text |

`style_group` is what links the four colourways of a style together, so the
swatch row on a product page can offer the other three.

## 3. Import the products

Products → Import → `products.csv`. Leave "Overwrite products with matching
handles" **off** for the first run.

You get 12 products, each with sizes 52/54/56/58. Handles match the old
site's URLs (`riwa-mushroom-taupe`), so the product pages keep their names.

Everything lands in a state that cannot sell:

| Field | Value | Why |
|---|---|---|
| `Status` | `draft` | Prices are still the placeholders from the build notes. |
| `Variant Inventory Qty` | `0` | Real stock counts aren't known here. |
| `Variant Inventory Policy` | `deny` | Cannot oversell while stock is 0. |
| `Variant Grams` | `0` | Weight drives courier rates — a guess mis-charges postage. |
| `Image Src` | empty | There is no product photography yet. |

### How the catalogue is modelled

**Settled: each colourway is its own product**, twelve in all, mirroring the
original site. Handles match the old `#/product/<id>` slugs, so the shop grid
keeps its twelve cards and every product URL survives the move.

The alternative was three products with Colour × Size as sixteen variants —
more conventional, and easier to read in the admin. It was rejected because
it collapses the twelve shop cards into three and changes every product URL.

Two things follow from that choice, both already handled:

- **Each product page needs its own words.** Four pages per style sharing one
  description is how Google decides three of them are duplicates and ranks
  one. The SEO descriptions are colour-specific, so all twelve differ. The
  body text is still shared within a style — colour-specific photography and
  a line or two of your own copy per colourway is what fully separates them.
- **Sold-out colourways are marked in the swatch row.** Because colourways are
  separate products rather than variants, Shopify will not grey them out for
  you; a sold-out swatch would otherwise look buyable. It is struck through
  and says so, and still links, since that page is where someone asks about
  a restock.

If the range ever grows past a few dozen products, give each style its own
automated collection and point `snippets/sibling-swatches.liquid` at that
instead of scanning every product.

## 4. Create the collections

Products → Collections. Both automated, matching on **Product tag**:

| Title | Handle | Condition |
|---|---|---|
| Everyday abaya | `everyday` | tag is equal to `everyday` |
| Occasion abaya | `occasion` | tag is equal to `occasion` |

The import already sets those tags.

**The collections will look empty on the storefront, and that is correct.**
The admin shows all twelve products in them, but the import deliberately
left every product as a draft, and drafts are not served to visitors. The
shop stays empty until the products are published — which waits on real
prices, real stock and photography. See "Still outstanding" at the end.

Menus and templates do not care about this: a collection exists as soon as
you create it, so step 7 can link to it whether or not anything is visible
inside yet.

## 5. Get the theme onto the store

Do this before creating the pages. A page can only be given a template that
the **published** theme defines, so until HANAN is up and published, the
`page.about` and `page.size-chart` options simply are not in the dropdown.

There are two ways in. **Route A needs no command line and is the one to
start with.** Route B is worth setting up later, when you are changing the
theme often enough that uploading a file each time gets tiring.

### Route A — upload a zip (no terminal)

**Build the zip.** From this folder, run `./make-theme-zip.sh`, or just zip
the contents of `theme/` yourself. One thing matters: the folders
`assets`, `config`, `layout`, `locales`, `sections`, `snippets` and
`templates` must sit at the **top level of the zip**, not inside a wrapper
folder. Shopify rejects the upload otherwise.

> On a Mac, selecting the `theme` folder and choosing "Compress" gives you a
> zip with `theme/` wrapped around everything, which Shopify will not take.
> Open the folder, select the seven folders inside it, and compress those.

**Upload it.** Online Store → Themes → **Add theme → Upload zip file** →
choose the file → Upload. It appears in the theme list, unpublished.

**Publish it.** Find HANAN in the list → **Actions → Publish**.

To change the theme later, build a new zip and upload it again — it arrives
as a separate theme, so publish the new one and delete the old.

### Route B — the Shopify CLI

Worth it for live reload while editing, and for pushing changes without
rebuilding a zip. It needs a terminal and Node.js.

1. **Install Node.js** from [nodejs.org](https://nodejs.org) — take the LTS
   version. This gives you `npm`, which installs the Shopify CLI.
2. **Open a terminal.** macOS: Terminal, in Applications → Utilities.
   Windows: PowerShell, from the Start menu.
3. **Install the CLI** — `npm install -g @shopify/cli@latest`
4. **Go to the theme folder.** Type `cd ` (with the space), then drag the
   `theme` folder from Finder or Explorer onto the terminal window — it
   fills in the path for you — then press Enter.
5. **Check and push:**

```sh
shopify theme check                     # should report only the 3 font warnings
shopify theme push --store your-store.myshopify.com --unpublished
```

Your store URL is the `.myshopify.com` one, not a custom domain. It is in
the admin under **Settings → Domains**, and in the browser address bar while
you are in the admin.

The first push opens a browser to log you in. Then publish as in Route A.

For live reload while editing: `shopify theme dev --store your-store.myshopify.com`.

### Either way

`shopify theme check` is Shopify's own linter. It is clean on this theme
apart from three `RemoteAsset` warnings about the Google Fonts link — see
"Known warnings" below. Anything else means something broke in transit.

**Publishing now is safe.** A trial store shows "Store access is restricted —
only visitors with the password can access your online store" at the top of
the admin. Nobody can see the shop without the password until you choose a
plan and lift it, so there is no window where customers meet a half-built
store. Check that banner is still there before you publish; if it has gone,
set the password back under **Online Store → Preferences → Restrict access**
until you are ready.

### Seeing the store while it is password-protected

Visiting the storefront URL now returns a password gate — that is the
restricted access working, not a fault. Two ways through:

- **Preview from the admin.** Click the eye icon beside **Online Store** in
  the sidebar, or **Online Store → Themes → ⋯ → Preview** on the theme you
  want. This opens the storefront with the gate bypassed, and is the quicker
  route while building.
- **Use the password.** **Online Store → Preferences**, scroll to the
  restricted-access section, and the password is there. Type it into the
  gate and the browser remembers it for that session. This is also the
  password to hand anyone you want to show the store to before launch.

Expect the store to look incomplete right after publishing: no pages, no
menus, and products still in draft. Steps 6 and 7 fill that in.

## 6. Create the pages

**Online Store → Pages.** Not under Content — that holds Metaobjects, Files,
Menus and Blog posts, but not Pages. Shopify has moved Pages between Content
and Online Store across admin versions, so if it is not where you expect:
press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>K</kbd> and search "Pages", or go
straight to `admin.shopify.com/store/<your-store>/pages`.

**The handle matters** — it is what picks the template, so a typo means the
page renders as a plain page instead of its designed one. Shopify derives the
handle from the title, but shows it under "Search engine listing" at the
bottom of the page editor, where you can correct it.

Do this before the menus: Shopify's link picker only offers pages that
already exist.

**Shopify has already made a Contact page.** Open that one and edit it rather
than adding a second — two pages competing for the `contact` handle leaves the
later one as `contact-1`, which no menu link or template will match.

The template is set in the page editor's right-hand column, under
**Online store → Theme template**.

| Title | Handle | Template | Body content |
|---|---|---|---|
| About | `about` | `page.about` | Paste `content/about.html` — see below. |
| Size chart | `size-chart` | `page.size-chart` | Leave empty — the table is in the theme. |
| Contact *(the one that exists)* | `contact` | `page.contact` | Leave empty. |
| Policies | `policies` | `page.policies` | Leave empty — it reads Settings → Policies. |

Only About takes body content. Open it, and in the **Content** toolbar click
the **`</>`** button at the far right — past the ⋯ — to switch to HTML.
Paste `content/about.html` whole, then click the button again to see it
laid out. Pasting into the visual editor instead turns the headings into
plain bold text, which the theme will not space and Google will not read as
headings.

**Set Visibility to Visible.** New pages can land on Hidden, and a hidden
page returns a 404 even to you — the password on the store is what keeps
customers out, not this setting.

**Fill in the meta description** under Search engine listing. It is what
Google shows beneath the link, and it is empty by default. For About:

> HANAN began with a need one mother could not find on the market — an abaya
> with nursing access concealed entirely within the design. Designed in East
> London. Its heading,
the Arabic lede and the founder sign-off are **not** in that file — they come
from the theme and are already filled in, so pasting them again would double
them up. `content/README.md` says which is which.

## 7. Build the menus

Content → Menus. Shopify has already created two of these — **Main menu** and
a footer one — so two get edited and two get created.

**The handle is what matters.** The theme looks each menu up by handle, and
Shopify derives the handle from the title when you first save. Get the title
right and the handle follows. A handle that does not match renders that part
of the site empty rather than throwing an error, so it is easy to miss.

When adding items, click **Add menu item** and use the picker in the Link
field — pick Collections, Pages or Home rather than typing a path by hand.
The picker only offers things that exist, which is the reason pages came first.

### Main menu — handle `main-menu`

The slide-out drawer behind the ☰ button.

| Item | Links to |
|---|---|
| Home | Home |
| About | Pages → About |
| Shop all | Collections → All products |
| Abayas | Collections → All products |
| ↳ Everyday abaya | Collections → Everyday abaya |
| ↳ Occasion abaya | Collections → Occasion abaya |
| Size chart | Pages → Size chart |
| Contact us | Pages → Contact |

The left column is the wording shown in the drawer; the right is what to
pick in the Link field. They do not have to match — the menu item reads
"Contact us" while the page it points at is titled "Contact".

Shopify starts this menu with **Home, Catalog and Contact**. Keep Home,
rename Catalog to "Shop all" and Contact to "Contact us", then add the rest.
Leave the **Name** field at the top of the page alone — the `main-menu`
handle comes from it.

The two indented items sit **underneath** Abayas. Add them as ordinary items
first, then drag each one slightly to the right — Shopify nests it and shows
it indented. The theme renders nested items as the smaller sub-links the
original site had under "Abayas".

Log in is not in this list. The theme adds it on its own, and switches it to
"Account" once someone is signed in.

### Shop filters — handle `shop-filters`

Create a new menu, titled exactly **Shop filters**. This is the
All / Everyday / Occasion row above the product grid, which replaces the
filter buttons on the original site.

| Item | Links to |
|---|---|
| All | Collections → All products |
| Everyday | Collections → Everyday abaya |
| Occasion | Collections → Occasion abaya |

### Footer — handle `footer`

Edit the one Shopify made. It arrives with its own default items — delete or
rename them, the same as with the main menu. This is the footer's **Shop**
column.

| Item | Links to |
|---|---|
| Shop all | Collections → All products |
| Everyday abaya | Collections → Everyday abaya |
| Occasion abaya | Collections → Occasion abaya |

Shopify seeds this menu with a **Search** item. Delete it — the header has no
search, so the link goes somewhere the theme does not otherwise offer.

### Help — handle `help`

Create a new menu, titled exactly **Help**. The footer's second column.

| Item | Links to |
|---|---|
| Size chart | Pages → Size chart |
| Contact us | Pages → Contact |
| Delivery | Pages → Policies |
| Returns | Pages → Policies |
| Privacy | Pages → Policies |

Then point the footer at it: **Online Store → Themes**, and click
**Edit theme** on the **live** theme at the top of the page — not on one of
the cards under "Draft themes", which edits a copy nobody is looking at.
Re-uploading a zip leaves the superseded version sitting there under a
near-identical name, so check which one you are opening. Deleting the old
draft once the new one is live saves picking wrong later.

In the editor: **Footer** in the left panel → click the block labelled
**Menu column – Help** → set **Menu** to `Help` → Save.

Only the Menu needs changing. The theme already names the two columns Shop
and Help, but points both at the `footer` menu, so the giveaway is a Help
column with the right heading over the Shop links. Nothing looks broken —
the links are simply the wrong ones.

## 8. Paste the policies

**Settings → Policies.** Four slots, four files in `policies/`:
`shipping.md`, `refund.md`, `privacy.md`, `terms.md`. Paste each into
its own slot.

Read `policies/README.md` first. These are drafts written to reflect UK
consumer law, not legal advice, and three things have to be filled in before
they are publishable:

- **`refund.md`** — your email address, in place of `[your email address]`,
  and your real returns address.
- **`privacy.md`** — your ICO registration number, your data retention
  periods, and your processor list. That list changes with this move:
  Shopify now does hosting, checkout and customer accounts, and Cloudflare
  comes off it.
- **`terms.md`** — not drafted. Shopify has a template under
  Settings → Policies → Terms of service → "Create from template".

One paragraph in `refund.md` is marked not to remove: if the 14-day
cancellation right is stated wrongly or left out, the cancellation period
extends to twelve months by law.

## 9. Set up shipping and tax

The site makes two promises at checkout that only come true if they are
configured here. Do this before the test order, or the test proves nothing.

### Shipping — Settings → Shipping and delivery

Match the policy exactly:

| Zone | Rate | Price | Condition |
|---|---|---|---|
| United Kingdom | Royal Mail Tracked 48 | £3.95 | free when order is over £120 |
| United Kingdom | Royal Mail Tracked 24 | £5.95 | — |
| Rest of world | by weight | — | as you decide |

**The free-over-£120 threshold must exist as a rate condition**, not only as
a line in the announcement bar. Add the £3.95 rate, then a second rate at
£0.00 with a minimum order price of £120.

This is also where the zero weights from the import bite: international
rates calculate by weight, and every variant currently weighs nothing. Weigh
one of each style before turning international shipping on.

### Tax — Settings → Taxes and duties

Every product page and the bag say **"Taxes included."** For that to be
true, prices must be set as tax-inclusive — the setting is under the United
Kingdom region, "Include tax in prices". Leave it off and VAT is added at
checkout, so the customer sees a total higher than the one you quoted.

If you are not VAT registered, there is no VAT to include and the wording is
still fine. Revisit it when you register.

## 10. Upload the film

**Content → Files → Upload** `hanan-story.mp4`, then copy its link.

Shopify does not accept `.mp4` as a theme asset, which is why the film is
not bundled with the theme. Paste the link into the theme editor, on the
live theme, under the **Story video** section. Without it, that section
renders its text half only rather than an empty frame.

## 11. Test a real order before taking real money

This is the step the original README flagged and nothing here replaces it.
It needs a paid plan — a trial store cannot take a payment, even a test one.

1. Set real prices, real stock and real weights on one product, publish it.
2. Turn on Shopify Payments **test mode**
   (Settings → Payments → Shopify Payments → Manage → Test mode).
3. Buy it with a test card. Check the confirmation email, the order in the
   admin, the shipping charged, and that stock went down by one.
4. Refund it. Check the refund lands and stock goes back up.
5. Turn test mode off.

Only then lift the store password and point a domain at Shopify.

---

## What changed in the move

**Gone, because Shopify does it properly now**

- The hash router (`#/shop`). Shopify serves real URLs, which it can also
  index — `#/shop` was invisible to search engines.
- The hard-coded `STYLES` catalogue. Products come from the admin.
- The demo bag and the "Demo only — payments not connected yet" button.
  The bag is Shopify's cart and the button goes to Shopify's checkout.
- The demo contact form, log-in and newsletter sign-up. All three are real
  Shopify forms now — contact mail arrives in the store's inbox, accounts
  are real customer accounts, and the newsletter adds a tagged customer.
- The build-notes panel. The outstanding items are in this file instead.

**Kept, unchanged**

- The whole stylesheet, straight out of `index.html`, tokens and all.
- The announcement carousel, the drawers, the reveal-on-scroll, and the
  story film player with its custom controls.
- Every word of the copy.

**New**

- Twelve `.webp`/`.jpg` assets, including four logos that were inline base64
  in the single file. As real files Shopify's CDN caches them, and they are
  no longer re-downloaded on every page.
- Size selection is built on radio inputs carrying `required`, so a browser
  blocks "Add to bag" with no size chosen even with JavaScript off.
- The cart updates over AJAX and re-renders from the server, so the drawer
  can never show a bag different from the real one.

## Known warnings

`shopify theme check` reports three `RemoteAsset` warnings for the Google
Fonts stylesheet. That is carried over from the original site, not
introduced here.

Worth knowing: loading Google Fonts from Google's servers sends visitors' IP
addresses to Google, which German courts have found breaches GDPR. Nothing
has been decided against a UK merchant that way, but self-hosting the three
families (Cormorant Garamond, Jost, Amiri) as theme assets removes the
question and the warning together, and makes the page faster. It is a
contained change — download the `.woff2` files, add them to `theme/assets/`,
and swap the `<link>` in `layout/theme.liquid` for `@font-face` rules.

## Still outstanding

Carried over from the build notes, none of them resolved by this move:

1. **Prices are placeholders.** Riwa £75, Raya £95, Jouri £135 are guesses.
2. **No product photography.** Twelve colourways, at least two shots each.
   The drawn silhouette stands in until then, and the swatch hexes are
   approximations from your colour descriptions.
3. **Fibre composition** has to be confirmed with the manufacturer — it must
   appear on the product page and the label by law, and the current care
   lines are a sensible guess, not their instructions.
4. **Legal identity.** Trading name, geographic address and company number
   are still `[Your ...]` placeholders, on the contact page and in the
   policies. Required.
5. **Reviews stay hidden** until they are real. Publishing invented reviews
   breaches UK consumer protection law. The section is off by default and
   the theme editor says so.
6. **Shipping weights.** Every variant imported at zero grams, so any
   weight-based rate — international especially — cannot price correctly
   until each style is weighed. Step 9 sets the rates up; the weights
   themselves are yours to measure.

## The old site

`index.html` and its Cloudflare Worker are untouched and still deploy as
before — `.assetsignore` keeps this whole folder off that site. Leave it
running until a test order has gone through Shopify end to end.
