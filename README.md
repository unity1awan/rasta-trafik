# Rasta Trafik

En röststyrd assistent för rastplatser längs svenska vägar. Skriv eller tala — och få direkta rekommendationer med Google Maps-länkar, filtrerade längs din faktiska resrutt.

---

## Features

- **Konversationsassistent** — Ställ frågor om rastplatser och få kortfattade, relevanta svar på svenska
- **Ruttbaserad filtrering** — Skriv "från Göteborg till Stockholm" och appen hämtar en verklig vägpolyline via OSRM och filtrerar Trafikverkets rastplatser till enbart de längs din rutt (3 km tunnel via Turf.js)
- **Röststyrning** — Hands-free via Web Speech API (STT). Svaret läses upp automatiskt med SpeechSynthesis (TTS) på svenska
- **GPS-sortering** — Om platsåtkomst ges sorteras rastplatserna på avstånd från din nuvarande position
- **Realtidsdata** — Rastplatser hämtas från Trafikverkets öppna API och cachas i 1 timme
- **Firebase Auth** — Inloggning via e-post/lösenord. Fungerar som gäst utan konto
- **PWA** — Installerbar på mobil, fungerar offline för statiska resurser
- **Mörkt läge** — Fullt stöd via `next-themes`

---

## Tech Stack

| Område | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) |
| Språk | TypeScript |
| Styling | Tailwind CSS v4 |
| Konversations-API | Anthropic API |
| Auth | Firebase Authentication |
| Rastplatsdata | Trafikverkets öppna API |
| Ruttberäkning | OSRM (gratis, ingen nyckel krävs) |
| Geocodning | Nominatim / OpenStreetMap |
| Spatial filtrering | Turf.js |
| Animationer | Framer Motion |
| Röst | Web Speech API (Chrome/Edge) |

---

## Getting Started

```bash
# Klona repot
git clone https://github.com/unity1awan/rasta-trafik.git
cd rasta-trafik

# Installera beroenden
npm install

# Konfigurera miljövariabler (se nedan)
cp .env.local.example .env.local

# Starta utvecklingsservern
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i webbläsaren.

---

## Environment Variables

Skapa en `.env.local`-fil i projektets rot med följande nycklar:

```env
# Konversations-API
ANTHROPIC_API_KEY=

# Trafikverket — rastplatsdata
TRAFIKVERKET_API_KEY=

# Firebase — autentisering
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

> `ANTHROPIC_API_KEY` och `TRAFIKVERKET_API_KEY` används enbart server-side och exponeras aldrig till klienten. Firebase-variablerna är publika (prefixade med `NEXT_PUBLIC_`) och säkra att inkludera i klientkod.

---

## Project Structure

```
app/
  api/chat/        # POST-route: validering, ruttfiltrering, streaming
src/
  components/      # UI-komponenter (chat, landing, layout, auth)
  hooks/           # useChat, useVoice, useConversations, useLocation, useUser
  services/        # trafikverketService, routeService, aiService
  utils/           # geo, routeFilter, extractRoute, firebase
  types/           # RestArea, Message, Conversation
public/
  sw.js            # Service worker (PWA)
  manifest.json    # Web App Manifest
```
