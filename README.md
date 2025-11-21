# MTG Commander Deck Builder ⚔️

A beautiful, modern web application for building optimized Magic: The Gathering Commander decks with synergy recommendations from EDHREC and comprehensive card search from Scryfall.

## Features

### 🎯 Commander Search
- **Local Commander Search** - Fast, instant searching from downloaded card library
- Smart search that automatically finds legendary creatures
- Visual card previews with high-quality images
- No API rate limits or network delays

### ✨ Synergy Recommendations
- Automatically fetch high-synergy cards from EDHREC
- View the most popular cards played with your commander
- Synergy percentages to help you build the best deck

### 📋 Deck Building
- Add cards to your deck with a single click
- Track your deck count (0-100 cards)
- Manage card quantities
- Commander automatically added to your deck

### 🔎 Advanced Card Search
- **Local Card Library** - Complete Scryfall database loaded on startup (~25MB)
- **Multiple Search Modes**:
  - **Smart Search** - Automatically detects the best search method
  - **Fuzzy Search** - Find cards with approximate/misspelled names (e.g., "Lightnng Bolt")
  - **Lexical Search** - Search in card text, types, and flavor text
  - **Wildcard Search** - Use `*` and `?` for pattern matching (e.g., "Lightning *", "Dra?on")
  - **Semantic Search** - Search by card attributes, mechanics, and context
- Instant search results without API rate limits
- Add any card to your deck

### 🎨 Premium Design
- Dark mode with vibrant MTG-themed colors
- Glassmorphic UI elements
- Smooth animations and transitions
- Fully responsive design

## Tech Stack

- **React 18** - Modern UI component library
- **Vite** - Fast build tool and development server
- **Electron** - Cross-platform desktop application framework
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **EDHREC API** - Commander synergy data
- **Scryfall API** - Comprehensive card database

## API Integration

### EDHREC API
```javascript
https://json.edhrec.com/pages/commanders/{commander-name}.json
```
Provides:
- High synergy cards
- Most popular cards
- Similar commanders
- Deck statistics

### Scryfall API
```javascript
// Bulk Data (loaded once on startup)
https://api.scryfall.com/bulk-data

// Card Search (for fallback only)
https://api.scryfall.com/cards/search?q={query}
```
Provides:
- Complete card library download (~25MB Oracle Cards)
- Card images and high-res artwork
- Card data and oracle text
- All card attributes (colors, types, mana cost, etc.)

## Local Card Library & Caching Strategy

The application downloads the complete Scryfall card library and caches it for fast subsequent loads:

### Card Library Features
- **First Load**: ~25MB Oracle Cards database downloaded from Scryfall (5-15 seconds)
- **Cached in JSON Files**: Stored locally as timestamped JSON files (e.g., `cardlibrary_1732123456789.json`)
- **Subsequent Loads**: Instant loading from cache (1-3 seconds)
- **In-Memory Search**: Complete card library kept in memory for instant results
- **Multiple Search Algorithms**: Fuzzy, lexical, wildcard, and semantic search
- **Smart Search**: Automatically picks the best search method based on your query
- **Offline Capable**: Works without internet after initial download

### Caching Strategy
- **Card Library**: Cached as timestamped JSON files for 24 hours (~25-30MB)
  - Files are stored in your user data directory: `%APPDATA%/mtg-commander-builder/card-library-cache/` (Windows)
  - Format: `cardlibrary_{timestamp}.json` (e.g., `cardlibrary_1732123456789.json`)
  - Keeps up to 3 most recent cache files, automatically cleans up older ones
- **Auto-Refresh**: Re-downloads from Scryfall after 24 hours
- **EDHREC Data**: Cached by commander name in localStorage (1-hour expiration)
- **Fast Startup**: 10x faster on subsequent loads thanks to file-based caching
- **Manual Refresh**: Use `window.cardLibrary.clearCache()` to force refresh
- **Portable & Debuggable**: Easy to inspect, backup, or transfer cache files

**Note:** First load takes 5-15 seconds, but all subsequent loads are 1-3 seconds thanks to caching!

## Getting Started

### Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to the project directory
cd mtg-commander-builder

# Install dependencies
npm install
```

### Development

Run the app in development mode with hot reload:

```bash
npm run dev
```

This will start the Vite development server and launch the Electron app with developer tools enabled.

### Building for Production

Build the application for your platform:

```bash
# Build for your current platform
npm run build

# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux
```

The built application will be available in the `release/` directory.

**Note:** On Windows, the build process automatically runs the deployment script to copy the app to your desktop and create a shortcut.

## Electron Architecture

This application uses Electron to package the React web app as a cross-platform desktop application.

### Electron Structure

- **Main Process** (`electron/main.js`) - Handles window creation, app lifecycle, and system integration
- **Preload Script** (`electron/preload.js`) - Secure bridge between main process and renderer
- **Renderer Process** - React application running in Electron's Chromium browser

### Electron Configuration

The Electron app is configured in `package.json` under the `build` section:

- **App ID**: `com.mtg.commander-builder`
- **Product Name**: `MTG Commander Builder`
- **Windows**: Creates NSIS installer with custom icon
- **macOS**: Creates DMG package with custom icon
- **Linux**: Creates AppImage with custom icon

### Electron Features

- **Auto-updater Ready**: Configuration supports electron-updater for automatic updates
- **Native Menus**: System tray and native OS menus
- **File System Access**: Secure file system access for cache management
- **Window Management**: Custom window controls and sizing
- **Developer Tools**: Accessible via `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS)

## PowerShell Deployment Scripts

The project includes PowerShell scripts for automated deployment on Windows.

### Available Scripts

#### `build-and-deploy.ps1`

Complete build and deployment automation script that:
1. Runs `npm run build` to build the application
2. Automatically deploys to desktop using `deploy.ps1`
3. Provides colored output and error handling

**Usage:**
```powershell
.\build-and-deploy.ps1
```

#### `deploy.ps1`

Deploys the built Electron app to your Windows desktop:
1. Reads version from `package.json`
2. Locates the built app in `release/{version}/win-unpacked/`
3. Copies the app folder to your desktop
4. Creates a desktop shortcut (`.lnk` file)
5. Sets proper working directory for the shortcut

**Usage:**
```powershell
# Deploy after building
.\deploy.ps1

# Or use the combined script
.\build-and-deploy.ps1
```

**Requirements:**
- Windows PowerShell 5.1 or later
- Build must be completed first (`npm run build`)
- App must exist in `release/{version}/win-unpacked/`

### Deployment Process

When you run the deployment script:

1. **Version Detection**: Automatically reads the version from `package.json`
2. **Path Resolution**: Finds the built app in `release/{version}/win-unpacked/`
3. **Desktop Copy**: Copies the entire app folder to your desktop as "MTG Commander Builder"
4. **Shortcut Creation**: Creates a desktop shortcut pointing to `MTG Commander Builder.exe`
5. **Cleanup**: Removes old versions before deploying new ones

**Output Locations:**
- **App Folder**: `%USERPROFILE%\Desktop\MTG Commander Builder\`
- **Shortcut**: `%USERPROFILE%\Desktop\MTG Commander Builder.lnk`

### Script Features

- ✅ **Error Handling**: Stops on errors with clear messages
- ✅ **Version Management**: Automatically uses version from package.json
- ✅ **Clean Deployment**: Removes old versions before deploying
- ✅ **Colored Output**: Easy-to-read status messages
- ✅ **Path Safety**: Uses proper path joining for cross-system compatibility

### Troubleshooting

**Script won't run:**
```powershell
# If you get execution policy errors, run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Build not found:**
- Ensure you've run `npm run build` first
- Check that `release/{version}/win-unpacked/` exists
- Verify the version in `package.json` matches the release folder

**Shortcut not created:**
- Check if you have write permissions to the desktop
- Ensure Windows Script Host is enabled
- Try running PowerShell as administrator

## Usage

1. **Wait for Card Library** - First load takes 5-15 seconds to download. Subsequent loads are instant (1-3s) thanks to caching!
2. **Search for a Commander** - Enter a legendary creature name in the search box
3. **Select Your Commander** - Click on a search result to view synergy recommendations
4. **View Synergy Cards** - Automatically displays cards that work well with your commander
5. **Build Your Deck** - Add cards from recommendations or search with advanced modes
6. **Use Advanced Search**:
   - **Smart Mode**: Type normally (e.g., "lightning bolt", "dragons")
   - **Fuzzy Mode**: Handle typos (e.g., "Lightnng Bolt" finds "Lightning Bolt")
   - **Wildcard Mode**: Use patterns (e.g., "Lightning *" finds all Lightning cards)
   - **Lexical Mode**: Search in card text (e.g., "destroy target creature")
   - **Semantic Mode**: Search by mechanics (e.g., "flying red 3")
7. **Manage Your Deck** - View, adjust quantities, and remove cards
8. **Track Progress** - Monitor your deck count (0-100 cards)

## File Structure

```
mtg-commander-builder/
├── electron/              # Electron main process files
│   ├── main.js           # Electron main process entry point
│   └── preload.js        # Preload script for secure IPC
├── src/                  # React source files
│   ├── components/       # React components
│   ├── utils/           # Utility functions and API clients
│   ├── types/           # TypeScript type definitions
│   ├── App.jsx          # Main React component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── assets/              # Static assets (icons, images)
├── release/             # Built application output
│   └── {version}/       # Version-specific builds
│       └── win-unpacked/ # Windows unpacked app
├── build-and-deploy.ps1 # PowerShell script: build + deploy
├── deploy.ps1           # PowerShell script: deploy to desktop
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── package.json         # Project metadata and scripts
└── README.md            # This file
```

## Key Features Implementation

### API Caching
```javascript
const cache = {
    commanders: new Map(),
    cards: new Map(),
    edhrec: new Map()
};
```

### State Management
```javascript
const state = {
    selectedCommander: null,
    deck: [],
    synergyCards: [],
    topCards: []
};
```

### Responsive Design
- Mobile-first approach
- Breakpoints at 768px
- Flexible grid layouts
- Touch-friendly interactions

## Platform Support

The desktop application runs on:

- **Windows** - Windows 10 and later
- **macOS** - macOS 10.13 (High Sierra) and later
- **Linux** - Most modern distributions (Ubuntu, Fedora, Debian, etc.)

## Performance Optimizations

1. **Local Card Library** - Eliminates network requests for card searches
2. **In-Memory Search** - Lightning-fast search across 70,000+ cards
3. **Smart Search Algorithms** - Optimized Levenshtein distance for fuzzy matching
4. **Indexed Data** - Fast lookups by name, type, text, and attributes
5. **API Caching** - EDHREC data cached in localStorage
6. **Lazy Loading** - Card images load as needed
7. **CSS Transitions** - Hardware-accelerated animations
8. **Minimal Dependencies** - Lightweight bundle size

## Design System

### Color Palette
- **Primary Background**: `#0a0e1a`
- **Magic Blue**: `#3b82f6`
- **Magic Purple**: `#8b5cf6`
- **Magic Pink**: `#ec4899`
- **Magic Gold**: `#f59e0b`
- **Magic Green**: `#10b981`

### Typography
- **Font Family**: Inter
- **Size Scale**: 0.875rem to 3rem
- **Weights**: 300, 400, 500, 600, 700, 800

### Spacing System
- **XS**: 0.5rem
- **SM**: 0.75rem
- **MD**: 1rem
- **LG**: 1.5rem
- **XL**: 2rem
- **2XL**: 3rem

## Future Enhancements

- [x] Local card library with instant search
- [x] Fuzzy, lexical, wildcard, and semantic search
- [x] File-based card library caching with timestamps for faster reloads
- [x] Electron desktop application
- [x] PowerShell deployment scripts for Windows
- [x] Copy deck list functionality
- [ ] Export deck to text/PDF/JSON
- [ ] Import deck from URL/text file
- [ ] Mana curve visualization
- [ ] Color distribution chart
- [ ] Price tracking integration (TCGPlayer/CardKingdom)
- [ ] Deck validation (100 cards exactly)
- [ ] Save/load decks to localStorage
- [ ] Share decks via URL
- [ ] Dark/light mode toggle
- [ ] Advanced filtering (colors, types, CMC, rarity)
- [ ] Regular expression search mode
- [ ] Auto-updater for Electron app

## Credits

- **EDHREC** - Commander synergy data and recommendations
- **Scryfall** - Comprehensive MTG card database and images
- **Wizards of the Coast** - Magic: The Gathering

## Disclaimer

MTG Commander Builder is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.

## License

This project is for educational and personal use only. All Magic: The Gathering card images and data are property of Wizards of the Coast.

---

**Built with ❤️ for the MTG Commander community**
