# Asset requirements

## In use (verified, from nsrl.in)

| File | Source | Notes |
| --- | --- | --- |
| `public/brand/nsrl-logo.png` | nsrl.in/nsrl-logo.png | Original, byte for byte |
| `public/brand/nsrl-logo-160.webp`, `-320.webp` | resampled from the original | Delivery copies; not redrawn or recoloured |
| `public/favicon.ico` | nsrl.in/favicon.ico | Original |
| `public/images/nsrl-truck-loading-dock-{480,800,1200}.webp` | nsrl.in/north-south-roadlines-truck-view.jpeg | Company's own photo, resized |
| `public/clients/britannia.svg`, `tata.svg` | the Wikimedia files nsrl.in itself displays | Official logos |
| `public/clients/dmart.png` | inline image on nsrl.in (196×46) | Low resolution; replace with a vector |

The 3D truck, road and scenery are procedural (no downloaded models). The truck's livery draws
the original logo file; it does not recreate it.

## Still needed

| Asset | Where it goes | Until supplied |
| --- | --- | --- |
| Bisleri, Samsung, Nilkamal official logos (SVG) | `public/clients/`, `CLIENTS` in site.config | Name set in type. Wikimedia rate-limited downloads; the live Samsung link is dead |
| DMart logo as SVG | `public/clients/dmart.svg` | Small PNG from the live site |
| Licensed photography: highway fleet (wide), yard/fleet in Indore, dispatch floor, warehouse, highway infrastructure, office exterior | `public/images/`, `IMAGES` in site.config (WebP/AVIF, ~1600–2400 px, record width/height) | Drawn road plates or diagrams; only one real photo exists |
| Optional: a GLB of a real NSRL vehicle (≤1.5 MB, Draco-compressed) | would replace `src/app/three/truck.ts` | Procedural truck |

Never use stock photos presented as NSRL's own operation, and never add client logos without a
confirmed client relationship.
