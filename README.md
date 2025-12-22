# ⚽ FPL Squad Craft

A modern, feature-rich Fantasy Premier League planning tool built with React, Vite, TailwindCSS, and the official FPL API.

![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.1-646cff?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-06b6d4?style=for-the-badge&logo=tailwindcss)

## ✨ Features

### 🎯 Advanced Squad Planner

- **Interactive Pitch & List Views**: Visualize your team on a classic pitch or detailed list.
- **Team Import**: Enter your FPL Team ID to instantly load your live squad, current rank, and team value.
- **Future Planning**: Plan transfers for future gameweeks. Changes made in future weeks do not affect your active squad.
- **"Ripple Effect" Logic**: Transfers made in GW(X) automatically cascade to GW(X+1), GW(X+2), etc.
- **Smart Validation**: Enforces valid formations, budget caps, and team limits (max 3 per team).
- **Gameweek Navigation**: Seamlessly switch between current stats and future planning modes.

### ⚡ Live Data Integration

- **Real-Time Points**: Player shirts display live points during active matchdays.
- **Live Rank Updates**: Background syncing ensures your Overall Rank and Points are always up to date.
- **Double Gameweek Support**: Visualizes multiple opponents for DGW players (e.g., "ARS, CHE").

### 📊 Dashboard & Analytics

- **Transfer Trends**: See the most transferred in/out players with sorting options.
- **Player Filtering**: Filter available players by position, price, team, and sort by various metrics (ICT, Form, Points).
- **FDR (Fixture Difficulty)**: Visual color-coding for upcoming fixtures.

### 🛠️ Technical Highlights

- **Local Storage Persistence**: Your squad, plans, and team info are saved locally. Refreshing the page doesn't lose your work.
- **Auto Gameweek Detection**: Automatically identifies the current/next gameweek.
- **Responsive Design**: Fully optimized mobile and desktop experience.
- **Dark Mode**: Built-in toggle for light/dark themes.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone [https://github.com/ofentsej/fpl-squad-craft.git](https://github.com/ofentsej/fpl-squad-craft.git)
cd fpl-squad-craft
```

2. **Install dependencies**

```bash
npm install

```

3. **Start development server**

```bash
npm run dev

```

4. **Open in browser**

Navigate to `http://localhost:5173`

## 🛠️ Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS 4** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Lucide React** - Iconography
- **FPL API** - Official Fantasy Premier League API

## 📡 API & Proxy

This app uses the official Fantasy Premier League API:

- **Bootstrap Data**: `https://fantasy.premierleague.com/api/bootstrap-static/`
- **Live Gameweek**: `https://fantasy.premierleague.com/api/event/{GW}/live/`
- **Entry/Manager Info**: `https://fantasy.premierleague.com/api/entry/{id}/`
- **Fixtures**: `https://fantasy.premierleague.com/api/fixtures/`

**Note**: To bypass CORS restrictions during development, requests are routed through `https://corsproxy.io/`.

## 🎨 Customization

### Change Theme Colors

Edit `src/index.css` and modify Tailwind's color variables or utility classes. The pitch green logic is handled in `src/components/Planner/Pitch.jsx`.

### Modify API Endpoints

Edit `src/hooks/useFPLApi.js` to change API behavior. This hook handles caching and request logic.

## 🐛 Troubleshooting

### CORS Errors

If API requests fail:

1. Ensure `corsproxy.io` is reachable.
2. Check your internet connection (FPL API blocks some IPs).
3. Verify the `useFPLApi.js` hook is correctly appending the proxy.

### Persistence Issues

If your team isn't saving:

- Clear your browser's Local Storage (Application Tab -> Local Storage -> Clear).
- Reload the page.

### GitHub Pages 404 Error

- Ensure `base` in `vite.config.js` matches your repo name.
- Check GitHub Pages settings are pointing to the `gh-pages` branch.

## 📝 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run deploy     # Deploy to GitHub Pages

```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

## 🙏 Acknowledgments

- [Fantasy Premier League](https://fantasy.premierleague.com/) for the data.
- [Lucide](https://lucide.dev/) for the icons.
- [TailwindCSS](https://tailwindcss.com/) for the styling engine.

## 📞 Contact

Ofentse Makhutja - [@ofentsem4khutj4](https://www.google.com/search?q=https://twitter.com/ofentsem4khutj4)

Project Link: [https://github.com/ofentsej/fpl-squad-craft](https://www.google.com/search?q=https://github.com/ofentsej/fpl-squad-craft)

---

⭐ **Star this repo if you find it helpful!**

Built with ❤️ by FPL enthusiasts, for FPL enthusiasts.

```

```
