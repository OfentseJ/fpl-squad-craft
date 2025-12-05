# ⚽ FPL React Hub

A modern Fantasy Premier League web application built with React, Vite, TailwindCSS, and the official FPL API.

![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.1-646cff?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-06b6d4?style=for-the-badge&logo=tailwindcss)

## ✨ Features

- 🏠 **Home Dashboard** - View current gameweek and quick stats
- 📊 **Transfer Trends** - See most transferred in/out players with sorting options
- ⚡ **Live Stats** - Real-time BPS, goals, assists, and points during matches
- 🎯 **Squad Planner** - Build your team with advanced filters
- 🌓 **Dark Mode** - Toggle between light and dark themes
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- 🔄 **Auto Gameweek Detection** - Automatically shows current/next gameweek
- ⚡ **Fast Performance** - API caching and optimized rendering

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/fpl-react-hub.git
cd fpl-react-hub
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
- **TailwindCSS 4.1** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Lucide React** - Beautiful icons
- **FPL API** - Official Fantasy Premier League API

## 📡 API Information

This app uses the official Fantasy Premier League API:

- **Bootstrap Data**: `https://fantasy.premierleague.com/api/bootstrap-static/`
- **Live Gameweek**: `https://fantasy.premierleague.com/api/event/{GW}/live/`
- **Fixtures**: `https://fantasy.premierleague.com/api/fixtures/`

**Note**: The API uses CORS proxy (`https://corsproxy.io/`) for development to bypass CORS restrictions.

## 🎨 Customization

### Change Theme Colors

Edit `src/index.css` and modify Tailwind's color variables:

```css
@import "tailwindcss";

/* Custom green theme - change to your preferred color */
.bg-green-600 {
  /* Your custom color */
}
```

### Modify API Endpoints

Edit `src/hooks/useFPLApi.js` to change API behavior or add new endpoints.

### Add New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/Navbar.jsx`

## 🐛 Troubleshooting

### CORS Errors in Development

If you encounter CORS errors:

1. The app uses `https://corsproxy.io/` by default
2. Alternative: Use Vite proxy (see `vite.config.js` comments)
3. Or use a browser extension like "CORS Unblock"

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### GitHub Pages 404 Error

- Ensure `base` in `vite.config.js` matches your repo name
- Check GitHub Pages settings are pointing to `gh-pages` branch
- Wait 2-3 minutes after deployment

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Fantasy Premier League](https://fantasy.premierleague.com/) for the API
- [Lucide](https://lucide.dev/) for beautiful icons
- [TailwindCSS](https://tailwindcss.com/) for styling
- FPL Community for inspiration

## 📞 Contact

Ofentse Makhutja - [@ofentsem4khutj4](https://twitter.com/ofentsem4khutj4)

Project Link: [https://github.com/ofentsej/fpl-squad-craft](https://github.com/ofentsej/fpl-squad-craft)

---

⭐ **Star this repo if you find it helpful!**

Built with ❤️ by FPL enthusiasts, for FPL enthusiasts.
