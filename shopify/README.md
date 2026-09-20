# HANAN on Shopify

Everything needed to move the site from Cloudflare Workers to a Shopify
store: the design as a real Shopify theme, the catalogue as an import, and
the policy texts ready to paste.

Nothing here is live and nothing here charges anyone money yet. The order
below is the order to do it in — products before theme, because the theme
renders real products.

```
shopify/
├── theme/          the site rebuilt as a Shopify theme
├── products.csv    12 colourways × 4 sizes = 48 variants
└── policies/       delivery, returns and privacy, ready to paste
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

## 5. Push the theme

Do this before creating the pages. A page can only be given a template that
the **published** theme defines, so until HANAN is up and published, the
`page.about` and `page.size-chart` options simply are not in the dropdown.

```sh
npm install -g @shopify/cli@latest      # once, per machine
cd shopify/theme
shopify theme check                     # should report only the 3 font warnings
shopify theme push --store your-store.myshopify.com --unpublished
```

The first push opens a browser to log you in. Then publish it:
**Online Store → Themes →** find HANAN **→ Actions → Publish**.

**Publishing now is safe.** A trial store shows "Store access is restricted —
only visitors with the password can access your online store" at the top of
the admin. Nobody can see the shop without the password until you choose a
plan and lift it, so there is no window where customers meet a half-built
store. Check that banner is still there before you publish; if it has gone,
set the password back under **Online Store → Preferences → Restrict access**
until you are ready.

`shopify theme check` is Shopify's own linter, and clean here apart from
three `RemoteAsset` warnings about the Google Fonts link — see
"Known warnings" below. Anything else means something broke in transit.

To work on it with live reload: `shopify theme dev --store your-store.myshopify.com`.

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
| About | `about` | `page.about` | The founder's story. Paste it from `index.html`, the About section. |
| Size chart | `size-chart` | `page.size-chart` | Leave empty — the table is in the theme. |
| Contact *(the one that exists)* | `contact` | `page.contact` | Leave empty. |
| Policies | `policies` | `page.policies` | Leave empty — it reads Settings → Policies. |

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
| Contact us | Pages → Contact us |

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

Edit the one Shopify made. This is the footer's **Shop** column.

| Item | Links to |
|---|---|
| Shop all | Collections → All products |
| Everyday abaya | Collections → Everyday abaya |
| Occasion abaya | Collections → Occasion abaya |

### Help — handle `help`

Create a new menu, titled exactly **Help**. The footer's second column.

| Item | Links to |
|---|---|
| Size chart | Pages → Size chart |
| Contact us | Pages → Contact us |
| Delivery | Pages → Policies |
| Returns | Pages → Policies |
| Privacy | Pages → Policies |

Then point the footer at it: **Online Store → Themes → Customise → Footer**,
open the second menu column, set Heading to `Help` and Menu to `Help`. The
theme ships both footer columns pointing at `footer`, so until you change
this one the Shop links appear twice.

## 8. Paste the policies

Settings → Policies. Use the drafts in `policies/`, and read that folder's
README first — several gaps have to be filled before they are publishable.

## 9. Upload the film

Content → Files → Upload `hanan-story.mp4`, then copy its link.

Shopify does **not** accept `.mp4` as a theme asset, which is why the film
is not bundled with the theme. Paste the link into the theme editor under
the Story video section. Without it, that section renders its text half only
rather than an empty frame.

## 10. Test a real order before taking real money

This is the step the original README flagged and nothing here replaces it.

1. Set real prices, real stock and real weights on one product, publish it.
2. Turn on Shopify Payments **test mode**
   (Settings → Payments → Shopify Payments → Manage → Test mode).
3. Buy it with a test card. Check the confirmation email, the order in the
   admin, and that stock went down by one.
4. Refund it. Check the refund lands and stock goes back up.
5. Turn test mode off.

Only then point the domain at Shopify.

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
6. **Shipping rates** must be set up to match what the policy promises,
   including free over £120 as an actual rate condition.

## The old site

`index.html` and its Cloudflare Worker are untouched and still deploy as
before — `.assetsignore` keeps this whole folder off that site. Leave it
running until a test order has gone through Shopify end to end.
