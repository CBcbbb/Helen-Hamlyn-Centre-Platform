# Helen Hamlyn Centre for Design Data Platform

The Helen Hamlyn Centre for Design Data Platform is a publicly accessible resource designed for artists, researchers, the public, and funders. This collaborative space enables artists to discover, follow, and adapt methods for their own contexts and creative practices. Using a rhizomatic methodology, this platform displays emerging knowledge from the Helen Hamlyn Centre for Design as an interconnected ecosystem. The visualization maps relationships between People, Partners, Projects, and Methods, revealing the holistic and reciprocal nature of creative research networks.

## Features

- **Dual View Modes**: Interactive D3.js graph visualization and accessible table view
- **Real-time Search**: Instant node highlighting and filtering capabilities
- **Type Filtering**: Filter by People, Partners, Projects, and Methods
- **Full Accessibility**: WCAG-compliant with screen reader support and keyboard navigation
- **Responsive Design**: Optimized for all screen sizes and devices
- **Admin Panel**: Password-protected `/admin` route for editing node data, with direct save support locally and on Vercel (see [ADMIN_GUIDE.md](ADMIN_GUIDE.md))

## Tech Stack

- **React** 19.1.0 - Modern React with hooks and context
- **D3.js** 7.9.0 - Data-driven visualizations
- **Tailwind CSS** 3.4.17 - Utility-first styling
- **Lucide React** 0.525.0 - Feather-based icon library
- **Express** / **cors** - Local API server backing the admin save flow

## Quick Start

### Prerequisites
- Node.js >= 14.0.0
- npm >= 6.0.0

### Installation
```bash
npm install
```

### Development
```bash
npm start
```
Opens at http://localhost:3000 (auto-detects available ports)

To use the admin panel locally with direct save (rather than downloading a file), run the frontend and API server together:
```bash
npm run dev
```
This starts the frontend on http://localhost:3000 and the API server (`local-api-server.js`) on http://localhost:3001. See [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for details.

### Rebuilding the Dataset
```bash
npm run data:build
```
Converts the CSV sources in `data/` into `public/data/graphData.json` (see [Data Format](#data-format) below).

### Production Build
```bash
npm run build
```

## Keyboard Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Cmd/Ctrl + E` | Toggle View | Switch between graph and table views |
| `Cmd/Ctrl + K` | Focus Search | Jump to search input |
| `Cmd/Ctrl + B` | Toggle Navigation | Show/hide sidebar |
| `?` | Show Help | Display keyboard shortcuts |

## Project Structure

```
src/
├── components/
│   ├── GraphView.js      # D3.js network visualization
│   ├── SimpleView.js     # Accessible table view
│   ├── Navigation.js     # Sidebar navigation
│   ├── Toolbar.js        # Top toolbar with search
│   ├── NodeDetails.js    # Node information panel
│   ├── KeyboardHelp.js   # Accessibility help modal
│   ├── Modal.js          # Generic resizable side panel modal
│   ├── SimpleFeedback.js # Draggable feedback button
│   ├── AdminRoute.js     # Gates access to the admin panel
│   ├── AdminLogin.js     # Admin password login form
│   └── AdminPanel.js     # Admin data editing UI
├── utils/
│   └── graphUtils.js     # Graph data processing utilities
├── RelationshipGraphApp.js # Main application component
├── App.js                # Top-level router (main app vs /admin)
└── index.js              # Application entry point

api/
└── save-data.js          # Vercel serverless function for admin saves

scripts/
└── convert.js            # Converts data/*.csv into public/data/graphData.json

data/
├── PEOPLE.csv
├── PARTNERS.csv
├── PROJECTS.csv
└── METHODS.csv

public/data/
├── graphData.json        # Knowledge graph dataset (generated)
└── LINKS.csv             # Link/relationship source data

local-api-server.js       # Local Express server backing admin saves in dev
```

## Data Format

`public/data/graphData.json` is generated from the CSV files in `data/` via `npm run data:build` (`scripts/convert.js`) — edit the CSVs (or use the admin panel) and rebuild rather than hand-editing the JSON.

The application expects JSON data in `public/data/graphData.json`:

```json
{
  "nodes": [
    {
      "id": "unique-identifier",
      "name": "Node Name",
      "type": "People|Partners|Projects|Methods",
      "description": "Detailed description",
      "properties": {
        "custom": "fields"
      }
    }
  ],
  "links": [
    {
      "source": "source-node-id",
      "target": "target-node-id",
      "relationship": "connection-type"
    }
  ]
}
```

### Node Types
- **People**: Researchers, experts, individuals
- **Partners**: Universities, organizations, companies
- **Projects**: Research projects, initiatives
- **Methods**: Techniques, methodologies, approaches

## Configuration

### Customizing Colors
Modify node colors in `src/utils/graphUtils.js`:

```javascript
export const getNodeColor = (type) => {
  const colors = {
    People: '#3b82f6',
    Partners: '#10b981',
    Projects: '#f59e0b',
    Methods: '#8b5cf6'
  };
  return colors[type] || '#6b7280';
};
```

### Adding Node Types
1. Update `visibleTypes` state in `RelationshipGraphApp.js`
2. Add color mapping in `getNodeColor` function
3. Update data schema accordingly

## Deployment

### Vercel
The project is configured for Vercel via `vercel.json`:
- Rewrites `/admin` to `index.html` so client-side routing handles the admin panel
- Rewrites everything else (except `/data/*`) to `index.html`
- `api/save-data.js` runs as a serverless function, so admin saves work in production without the local API server

### Static Hosting
```bash
npm run build
# Deploy build/ directory to static host
```

### Docker
```dockerfile
FROM nginx:alpine
COPY build/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables
- `PORT`: Server port (default: 3000)
- `PUBLIC_URL`: Base URL for deployment

## Development

### Code Standards
- ESLint configuration for React best practices
- Accessibility-first component development
- Semantic HTML and ARIA attributes
- Keyboard navigation support required

### Testing
```bash
npm test                    # Run test suite
npm test -- --coverage     # Generate coverage report
```

### Adding Components
1. Create component in `src/components/`
2. Implement accessibility features (ARIA, keyboard nav)
3. Add to main application
4. Update documentation

## Accessibility Features

- **Screen Reader Support**: Full ARIA labeling and semantic markup
- **Keyboard Navigation**: Tab order and focus management
- **Skip Links**: Quick navigation to main content
- **Status Announcements**: Live regions for dynamic updates
- **High Contrast**: Compatible with system preferences

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/feature-name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/feature-name`)
5. Open Pull Request

### Pull Request Guidelines
- Include accessibility testing results
- Add unit tests for new features
- Update documentation as needed
- Follow existing code style

## Troubleshooting

**Port 3000 in use**: Application auto-detects available ports or set `PORT=3001 npm start`

**Data not loading**: Verify `public/data/graphData.json` exists with valid JSON format

**Performance issues**: Check browser console for D3.js rendering warnings

## Acknowledgments

- [D3.js](https://d3js.org/) for powerful data visualization
- [React](https://reactjs.org/) for component architecture
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/) for accessibility standards