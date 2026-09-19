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
up empty.** Settings → Custom data → Products → Add definition. For each
one, namespace `custom`, and the key and type exactly as listed:

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

Each colourway is its own product, mirroring the original site. The
alternative — three products with Colour × Size as 16 variants — is more
conventional and easier to read in the admin, but it collapses twelve shop
cards into three and changes every product URL. **Decide before importing**,
because changing it later means redoing the products.

## 4. Create the collections

Products → Collections. Both automated, matching on **Product tag**:

| Title | Handle | Condition |
|---|---|---|
| Everyday abaya | `everyday` | tag is equal to `everyday` |
| Occasion abaya | `occasion` | tag is equal to `occasion` |

The import already sets those tags.

## 5. Build the menus

Content → Menus.

**Main menu** (`main-menu`) — this is the slide-out drawer:

- Home → `/`
- About → `/pages/about`
- Shop all → `/collections/all`
- Abayas → `/collections/all`, with two nested items:
  - Everyday abaya → `/collections/everyday`
  - Occasion abaya → `/collections/occasion`
- Size chart → `/pages/size-chart`
- Contact us → `/pages/contact`

**Shop filters** (`shop-filters`) — the filter row on collection pages:
All → `/collections/all`, Everyday → `/collections/everyday`,
Occasion → `/collections/occasion`.

**Footer** (`footer`) and a second menu for the Help column, matching the
original: size chart, contact, delivery, returns, privacy, account.

## 6. Create the pages

Content → Pages. The handle matters — it picks the template.

| Title | Handle | Template | Body content |
|---|---|---|---|
| About | `about` | `page.about` | The founder's story. Paste it from `index.html`, the About section. |
| Size chart | `size-chart` | `page.size-chart` | Leave empty — the table is in the theme. |
| Contact us | `contact` | `page.contact` | Leave empty. |
| Policies | `policies` | `page.policies` | Leave empty — it reads Settings → Policies. |

## 7. Paste the policies

Settings → Policies. Use the drafts in `policies/`, and read that folder's
README first — several gaps have to be filled before they are publishable.

## 8. Upload the film

Content → Files → Upload `hanan-story.mp4`, then copy its link.

Shopify does **not** accept `.mp4` as a theme asset, which is why the film
is not bundled with the theme. Paste the link into the theme editor under
the Story video section. Without it, that section renders its text half only
rather than an empty frame.

## 9. Push the theme

```sh
npm install -g @shopify/cli@latest      # once, per machine
cd shopify/theme
shopify theme push --store your-store.myshopify.com --unpublished
```

The first push asks you to log in through the browser. `--unpublished`
uploads it as a draft, so the store's current theme stays live until you
choose to switch.

To work on it with live reload: `shopify theme dev --store your-store.myshopify.com`.

Check it with Shopify's own linter before pushing:

```sh
shopify theme check
```

It should report only three `RemoteAsset` warnings, for the Google Fonts
link — see "Known warnings" below.

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
