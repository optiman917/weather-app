import axios from 'axios';
import { AppDataSource } from '../utils/database';
import { WeatherCache } from '../models/weatherCache';

const API_URL = 'https://staging.v4.api.wander.com/hiring-test/weather';

const normalizeDate = (date: string) => {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new Error('Invalid date format1.');
  }
  return parsedDate.toISOString().split('T')[0];
};

export const getWeather = async (city: string, date: string) => {
  const weatherRepo = AppDataSource.getRepository(WeatherCache);
  const normalizedDate = normalizeDate(date);
  const cache = await weatherRepo.findOne({ where: { city, date: normalizedDate } });

  if (cache) {
    const now = new Date();
    const fetchedAt = new Date(cache.fetchedAt);
    const cacheDuration = 3600000; // 1 hour in milliseconds

    if (now.getTime() - fetchedAt.getTime() < cacheDuration) {
      return {
        celsius: cache.celsius,
        fahrenheit: cache.fahrenheit
      };
    }
  }

  try {
    const response = await axios.post(API_URL, { city, date: normalizedDate }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const celsius = response.data.celcius !== undefined
      ? response.data.celcius
      : (response.data.fahrenheit - 32) * 5 / 9;

    const fahrenheit = response.data.fahrenheit !== undefined
      ? response.data.fahrenheit
      : (response.data.celcius * 9 / 5) + 32;

    const roundedCelsius = Math.round(celsius * 100) / 100;
    const roundedFahrenheit = Math.round(fahrenheit * 100) / 100;

    const newCache = weatherRepo.create({
      city,
      date: normalizedDate,
      celsius: roundedCelsius,
      fahrenheit: roundedFahrenheit,
      fetchedAt: new Date()
    });

    await weatherRepo.save(newCache);

    return {
      celsius: roundedCelsius,
      fahrenheit: roundedFahrenheit
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }

      if (status === 418) {
        throw new Error('Request refused by the server. Please try again.');
      }

      if (status === 500) {
        const errorMessage = error.response?.data?.error;

        if (errorMessage === 'City is required') {
          throw new Error('City is required.');
        }

        if (errorMessage === 'Date is in the future') {
          throw new Error('Date is in the future.');
        }

        if (errorMessage?.includes('invalid_date')) {
          throw new Error('Invalid date format.');
        }

        throw new Error('Internal server error. Please try again later.');
      }
    }

    throw new Error('Error fetching weather data. Please try again.');
  }
};
