import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getWeather } from '../services/weatherService';
import { initializeDatabase, AppDataSource } from '../utils/database';

const mock = new MockAdapter(axios);

beforeAll(async () => {
  await initializeDatabase();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

afterEach(() => {
  mock.reset();
});

test('fetches weather data and caches it', async () => {
  const city = 'A';
  const date = '2024-07-17';

  mock.onPost('https://staging.v4.api.wander.com/hiring-test/weather').reply(200, { celcius: 25 });

  const weatherData = await getWeather(city, date);
  expect(weatherData.celsius).toBe(25);
  expect(weatherData.fahrenheit).toBeCloseTo(77, 2);
});

test('handles API rate limit error', async () => {
  const city = 'B';
  const date = '2024-07-17';

  mock.onPost('https://staging.v4.api.wander.com/hiring-test/weather').reply(429);

  await expect(getWeather(city, date)).rejects.toThrow('API rate limit exceeded. Please try again later.');
});

test('handles request refused by the server (418 error)', async () => {
  const city = 'C';
  const date = '2024-07-17';

  mock.onPost('https://staging.v4.api.wander.com/hiring-test/weather').reply(418);

  await expect(getWeather(city, date)).rejects.toThrow('Request refused by the server. Please try again.');
});

test('handles internal server error with specific message', async () => {
  const city = 'D';
  const date = '2024-07-17';

  mock.onPost('https://staging.v4.api.wander.com/hiring-test/weather').reply(500, { error: 'City is required' });

  await expect(getWeather(city, date)).rejects.toThrow('City is required.');
});

test('handles internal server error with invalid date message', async () => {
  const city = 'E';
  const date = '2024-07-17';

  mock.onPost('https://staging.v4.api.wander.com/hiring-test/weather').reply(500, { error: '[\n  {\n    "code": "invalid_date",\n    "path": [\n      "date"\n    ],\n    \"message\": \"Invalid date\"\n  }\n]' });

  await expect(getWeather(city, date)).rejects.toThrow('Invalid date format.');
});

test('handles internal server error with future date message', async () => {
  const city = 'F';
  const date = '2024-07-17';

  mock.onPost('https://staging.v4.api.wander.com/hiring-test/weather').reply(500, { error: 'Date is in the future' });

  await expect(getWeather(city, date)).rejects.toThrow('Date is in the future.');
});

test('handles generic internal server error', async () => {
  const city = 'G';
  const date = '2024-07-17';

  mock.onPost('https://staging.v4.api.wander.com/hiring-test/weather').reply(500);

  await expect(getWeather(city, date)).rejects.toThrow('Internal server error. Please try again later.');
});
