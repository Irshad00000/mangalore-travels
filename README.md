# Mangalore Travels — Responsive React

## Run

Use Node.js 20.20.2 (or another supported Node 20.19+ / 22.12+ version), then:

```bash
npm install
npm run dev
```

Open the Local URL shown by Vite.

## Production build

```bash
npm run build
npm run preview
```

## Features
- Responsive mobile-first layout for phones, tablets, laptops and large screens.
- 2 Swift Dzire cars + 1 Ertiga.
- Required booking fields: name, phone, from and to.
- Optional custom location/landmark and browser GPS.
- WhatsApp booking to +91 82960 56692.
- Call to Book validates the form, opens WhatsApp with the booking text, then opens the phone dialer.
- Add Review form with local-device storage and WhatsApp sharing.
- No login/registration required.

## Important
A website cannot silently send a WhatsApp message. WhatsApp opens with the prepared message and the customer must tap Send.

Reviews saved with localStorage are device-specific; they are not a shared online review database.
