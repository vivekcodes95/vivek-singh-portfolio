# Goa Airbnb Flat Finder

An interactive map of 92 Goa flats listed for monthly rent, with an estimated Airbnb profit for each. Popular spots (beaches, nightlife, cafés, markets, heritage sites, airports and rail) are shown as diamonds, and flats as circles coloured by verdict.

**Live site:** https://vivekdesigns.com/goa-airbnb-flat-finder/

## Features
- Map of every listing, coloured Strong / Marginal / Loss by estimated monthly profit
- Filters for area, size, furnishing, verdict, max rent, min profit, distance to the nearest beach, and recently refreshed listings, plus options to hide flagged listings and gated complexes
- Click any popular spot to show only the flats within 3 or 5 km of it
- Earnings model sliders (nightly rate, occupancy, Airbnb fee, "Strong" threshold) that recalculate every listing
- Each listing's popup has a revenue breakdown, the nearest beach and spots, and a link to the original Housing.com listing
- Full spreadsheet: [`data/Goa_Airbnb_Rental_Flats.xlsx`](data/Goa_Airbnb_Rental_Flats.xlsx)

## Data
- **Listings:** Housing.com, captured 17 Oct – 2 Nov 2026 (`data/listings.json`). Pins are placed at the **locality**, not the exact building.
- **Popular spots:** `data/hotspots.json`, with approximate coordinates.
- **Earnings estimates** are starting assumptions (Goa market references: AirDNA, Airbtics, BnbCalc), not quotes. Check comparable Airbnbs before signing.

## Before running any flat as an Airbnb
You need the owner's written consent to sublet, a society NOC if the flat is in a gated complex, and a Goa Department of Tourism registration (Category D). Airbnb won't list unregistered Goa properties.

## Run locally
```
python3 -m http.server
```
Then open http://localhost:8000. The site is static: no build step, and Leaflet is bundled in `vendor/`.

Static map boundaries © DataMeet (CC BY 4.0). Online map tiles © OpenStreetMap contributors; satellite imagery © Esri. Not financial or legal advice.
