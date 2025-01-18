import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { MongoClient, ObjectId } from 'mongodb';
import { hotels } from './db/seeds/hotels';
import { countries } from './db/seeds/countries';
import { cities } from './db/seeds/cities';
import { app } from './index';

describe('API endpoints', () => {
  let client: MongoClient;
  let dbName: string;

  beforeAll(async () => {
    client = new MongoClient(process.env.DATABASE_URL!);
    await client.connect();
    const db = client.db();
    dbName = db.databaseName;

    await db.collection('hotels').insertMany(hotels);
    await db.collection('countries').insertMany(countries);
    await db.collection('cities').insertMany(cities);
  });

  afterAll(async () => {
    if (client) {
      await client.db(dbName).dropDatabase();
      await client.close();
    }
  });

  // -------------------------------------------------------
  // 1) SEARCH ROUTE TESTS
  // -------------------------------------------------------
  it('returns empty arrays when searchTerm is empty', async () => {
    // /search?q=
    const response = await request(app).get('/search?q=').expect(200);
    expect(response.body).toEqual({
      hotels: [],
      countries: [],
      cities: [],
    });
  });

  it('searches hotels by name', async () => {
    const response = await request(app).get('/search?q=Sai Kaew').expect(200);
    expect(response.body.hotels).toHaveLength(1);
    expect(response.body.hotels[0].hotel_name).toBe('Sai Kaew Beach Resort');
  });

  it('searches by partial country name', async () => {
    const response = await request(app).get('/search?q=United').expect(200);
    expect(response.body.countries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          country: expect.stringMatching(/United/),
        }),
      ])
    );
  });

  it('handles errors in /search (forces Mongo error)', async () => {
    const originalConnect = MongoClient.prototype.connect;
    vi.spyOn(MongoClient.prototype, 'connect').mockRejectedValueOnce(
      new Error('Forced Mongo error')
    );

    const res = await request(app).get('/search?q=anything');
    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({
      error: 'An error occurred on the server.',
    });

    MongoClient.prototype.connect = originalConnect;
  });

  // -------------------------------------------------------
  // 2) HOTELS/:ID ROUTE TESTS
  // -------------------------------------------------------
  it('gets a hotel by ID', async () => {
    const db = client.db();
    const oneHotel = await db.collection('hotels').findOne({});
    expect(oneHotel).toBeTruthy();

    const response = await request(app)
      .get(`/hotels/${oneHotel?._id}`)
      .expect(200);

    expect(response.body.hotel_name).toBe(oneHotel?.hotel_name);
  });

  it('returns 404 if hotel not found', async () => {
    const fakeId = new ObjectId().toString();
    const response = await request(app).get(`/hotels/${fakeId}`);
    expect(response.status).toBe(404);
    expect(response.body.error).toMatch(/Hotel not found/i);
  });

  it('handles errors in /hotels/:id route', async () => {
    const originalConnect = MongoClient.prototype.connect;
    vi.spyOn(MongoClient.prototype, 'connect').mockRejectedValueOnce(
      new Error('DB error')
    );
    const res = await request(app).get(`/hotels/12345`);
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Error fetching hotel details');
    MongoClient.prototype.connect = originalConnect;
  });

  // -------------------------------------------------------
  // 3) CITIES/:NAME ROUTE TESTS
  // -------------------------------------------------------
  it('gets a city by name', async () => {
    const db = client.db();
    const oneCity = await db.collection('cities').findOne({});
    expect(oneCity).toBeTruthy();

    const res = await request(app)
      .get(`/cities/${encodeURIComponent(oneCity?.name)}`)
      .expect(200);
    expect(res.body.name).toBe(oneCity?.name);
  });

  it('returns 404 if city not found', async () => {
    const res = await request(app).get('/cities/SomeMissingCity');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/City not found/i);
  });

  it('handles DB errors in /cities/:name route', async () => {
    const originalConnect = MongoClient.prototype.connect;
    vi.spyOn(MongoClient.prototype, 'connect').mockRejectedValueOnce(
      new Error('Cities DB error')
    );
    const res = await request(app).get('/cities/testcity');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Error fetching city details');
    MongoClient.prototype.connect = originalConnect;
  });

  // -------------------------------------------------------
  // 4) COUNTRIES/:ISO ROUTE TESTS
  // -------------------------------------------------------
  it('gets a country by ISO code', async () => {
    const db = client.db();
    const oneCountry = await db.collection('countries').findOne({});
    expect(oneCountry).toBeTruthy();

    const res = await request(app)
      .get(`/countries/${oneCountry?.countryisocode}`)
      .expect(200);
    expect(res.body.country).toBe(oneCountry?.country);
  });

  it('returns 404 if country not found', async () => {
    const res = await request(app).get('/countries/ZZZ');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/Country not found/i);
  });

  it('handles DB errors in /countries/:iso route', async () => {
    const originalConnect = MongoClient.prototype.connect;
    vi.spyOn(MongoClient.prototype, 'connect').mockRejectedValueOnce(
      new Error('Countries DB error')
    );

    const res = await request(app).get('/countries/GB');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Error fetching country details');

    MongoClient.prototype.connect = originalConnect;
  });
});
