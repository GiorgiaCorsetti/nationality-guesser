// Importing required modules
import express from 'express';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getName } from 'country-list';

// __dirname workaround for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();

// Middleware setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(join(__dirname, 'public')));

// Store recent searches in memory
let recentSearches = [];

// Routes
app.get('/', (req, res) => {
    res.render('index', { recentSearches });
});

app.get('/about', (req, res) => {
    res.render('about'); // Renders the about.ejs file
});

app.get('/guess-nationality', async (req, res) => {
    const name = req.query.name.trim();
    if (!name) {
        return res.send('Please provide a name');
    }

    // Updating recent searches
    recentSearches.unshift(name); // Add new search to the start of the array
    recentSearches = recentSearches.slice(0, 5); // Keep only the 5 most recent searches

    try {
        const response = await axios.get(`https://api.nationalize.io/?name=${name}`);
        const data = response.data;
        const countriesWithFullNames = data.country.map((item) => ({
            country_id: getName(item.country_id) || item.country_id,
            probability: item.probability
        }));

        res.render('result', { name: data.name, countries: countriesWithFullNames, recentSearches });
    } catch (error) {
        console.error('API request failed:', error);
        res.send('Error fetching nationality data');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));