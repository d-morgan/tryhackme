import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();

if (process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL) {
  await import('./db/startAndSeedMemoryDB');
}

const PORT = process.env.PORT || 3001;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const DATABASE_URL = process.env.DATABASE_URL;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/search', async (req, res) => {
  const searchTerm = (req.query.q || '').toString().trim();

  if (!searchTerm) {
    return res.json({
      hotels: [],
      countries: [],
      cities: [],
    });
  }

  const mongoClient = new MongoClient(DATABASE_URL);

  try {
    await mongoClient.connect();
    const db = mongoClient.db();

    const regex = new RegExp(searchTerm, 'i');

    const hotels = await db
      .collection('hotels')
      .find({
        $or: [
          { hotel_name: { $regex: regex } },
          { city: { $regex: regex } },
          { country: { $regex: regex } },
        ],
      })
      .toArray();

    const countries = await db
      .collection('countries')
      .find({
        country: { $regex: regex },
      })
      .toArray();

    const cities = await db
      .collection('cities')
      .find({
        name: { $regex: regex },
      })
      .toArray();

    res.json({ hotels, countries, cities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred on the server.' });
  } finally {
    await mongoClient.close();
  }
});

app.get('/hotels/:id', async (req, res) => {
  const { id } = req.params;
  const mongoClient = new MongoClient(DATABASE_URL);

  try {
    await mongoClient.connect();
    const db = mongoClient.db();
    const hotel = await db
      .collection('hotels')
      .findOne({ _id: new ObjectId(id) });

    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json(hotel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching hotel details' });
  } finally {
    await mongoClient.close();
  }
});

app.get('/cities/:name', async (req, res) => {
  const { name } = req.params; // city name

  const mongoClient = new MongoClient(DATABASE_URL);

  try {
    await mongoClient.connect();
    const db = mongoClient.db();
    const city = await db.collection('cities').findOne({ name });

    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    res.json(city);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching city details' });
  } finally {
    await mongoClient.close();
  }
});

app.get('/countries/:iso', async (req, res) => {
  const { iso } = req.params;

  const mongoClient = new MongoClient(DATABASE_URL);

  try {
    await mongoClient.connect();
    const db = mongoClient.db();
    const country = await db
      .collection('countries')
      .findOne({ countryisocode: iso });

    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }

    res.json(country);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching country details' });
  } finally {
    await mongoClient.close();
  }
});

app.listen(PORT, () => {
  console.log(`API Server Started at ${PORT}`);
});

export { app };
