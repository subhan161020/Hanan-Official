# Moving HANAN to Shopify

This folder holds the Shopify-side groundwork. Nothing here is live, and
nothing here charges anyone money yet.

## What's in here

`products.csv` — the whole catalogue as a Shopify product import: the 12
colourways from `STYLES` in `index.html`, each with its four sizes, so 48
variant rows. It is generated from the site itself rather than retyped, so
the two cannot drift apart.

Each colourway is its own Shopify product, which mirrors how the site
already works (`#/product/riwa-mushroom-taupe` is a page in its own right,
with sibling swatches linking across). The handles match those slugs
exactly, so existing links survive the move.

The alternative is three products with Colour × Size as 16 variants each.
That is the more conventional Shopify shape and makes stock easier to read
in the admin, but it collapses the twelve shop cards into three and changes
every product URL. Worth deciding before the first import, because changing
it afterwards means redoing the products.

## Importing it

Shopify admin → **Products** → **Import** → upload `products.csv`.
Leave "Overwrite products with matching handles" **off** for the first run.

## The safe defaults, and why

The import deliberately lands in a state that cannot sell anything:

| Field | Value | Why |
|---|---|---|
| `Status` | `draft` | Prices are still placeholders. Nothing is visible to customers until you publish it. |
| `Published` | `FALSE` | Same reason. |
| `Variant Inventory Qty` | `0` | Real stock counts aren't known here. |
| `Variant Inventory Policy` | `deny` | Cannot oversell while stock is 0. |
| `Variant Grams` | `0` | Shipping weight drives courier rates — a guess here would quietly mis-charge postage. |
| `Image Src` | empty | There is no product photography yet; the site still uses drawn silhouettes. |

## Before anything is published

1. **Real prices.** £75 / £95 / £135 are the placeholders from the build
   notes, carried across as-is. Set the real ones in Shopify *and* in
   `STYLES` so the site and the store agree.
2. **Real stock**, per size, per colourway.
3. **Weigh one of each style** and set `Variant Grams`. Until then, postage
   rates are guesswork.
4. **Photography.** Twelve colourways × at least two shots. The site's
   `phImg()` placeholder silhouettes go at the same time.
5. **Fibre composition**, confirmed with the manufacturer — it has to be on
   the product page and the label by law, and the current care lines are a
   sensible guess, not the manufacturer's instructions.

## What carries over from the site

These are already written and only need entering in the Shopify admin:

- **Delivery** — Standard (Royal Mail Tracked 48) £3.95, free over £120;
  Express (Royal Mail Tracked 24) £5.95. Set as shipping rates, and make
  the free-over-£120 threshold a rate condition rather than a promise in
  the banner only.
- **Returns** — 14 days to cancel, 14 further days to return, refund
  including standard outbound delivery. Shopify's returns policy field.
- **Privacy / terms** — already drafted under `#/policies`.

The legal-identity gaps flagged in the build notes (`[Your ...]` —
trading name, geographic address, company number) are required on a
Shopify store too. They go in Settings → Store details and the policy pages.
