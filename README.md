# Norvax Hub

React/Vite storefront for individually packed honey sticks. Keeps the existing product photography and brand mark, with a responsive editorial layout, a selectable 5g/10g collection, persistent shopping bag and email enquiry drafts.

## Development

```sh
npm ci
npm run dev
npm run build
node --test tests/catalog.test.js
```

## Product animation

`src/HoneyScene.jsx` contains lazy-loaded Three.js product, filling and pouring scenes. Clear flexible wrappers, an amber fill, seals and labels are modelled procedurally; the original bee logo is applied to the label texture. These are product illustrations rather than photographic manufacturing footage. The model is based on the existing photos, not measured production CAD.

`src/HoneyIllustration.jsx` provides animated SVG scenes when WebGL is unavailable. Scenes respect reduced-motion preferences and include pause/replay controls. WebGL rendering pauses when off-screen or the document is hidden. GPU resources are disposed on unmount.

## Orders and contact

Prices, payments and a contact backend were not configured in the original site. The bag now starts empty, validates restored local-storage data, and creates an enquiry summary with the selected variants and quantities. The contact form prepares a `mailto:` link; a visitor must review and send the email in their own email application. It does not silently send messages or claim submission success. The existing `hello@norvaxhub.com` address is retained in `src/App.jsx`; confirm it before accepting enquiries. No payment is collected.

## Validation

- Production build passes. Three.js is a separately loaded chunk; Vite reports its chunk-size advisory.
- Six regression tests cover catalogue weights, cart merging and bounds, corrupt storage, and exact enquiry summaries.
- Desktop and 390px-frame browser checks cover navigation, size/pack selection, cart totals and email-draft preparation. No email was sent.
- The cloud preview browser has WebGL disabled, so animated SVG fallback was inspected. Full WebGL visual validation remains necessary on a GPU-capable device before production release.

The existing Vercel project is `norvax-hub`. Retain that project and domain when deploying this repository.
