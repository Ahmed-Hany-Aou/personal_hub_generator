# Ahmed Hany - Digital Business Card

## Overview
A digital business card / personal hub for Ahmed Hany (Software Engineer). Displays contact links, portfolio, CV, GitHub, LinkedIn, and a QR code image. Also includes a Node.js CLI tool for generating QR codes.

## Project Structure

- `index.html` — Main static page: the digital business card
- `server.js` — Simple Node.js HTTP server serving static files on port 5000
- `index.js` — CLI tool: prompts user for a URL and generates a QR code PNG
- `generate_card.js` — Script for generating the business card PNG with QR code
- `solution.js` — Additional script
- `profile_pic.png` — Profile picture displayed on the card
- `contact.vcf` — vCard contact file (downloadable from the card)
- `qr_code.svg/png` — QR code assets

## Running

- **Frontend**: `node server.js` — serves `index.html` on `0.0.0.0:5000`
- **QR CLI**: `node index.js` — interactive CLI to generate QR codes

## Deployment
- Configured as a static site deployment (publicDir: ".")

## Dependencies
- `@inquirer/input` — CLI input prompts
- `inquirer` — CLI prompts
- `jimp` — Image processing
- `qr-image` — QR code generation
- `fs` — Node built-in (listed as dep for compatibility)
