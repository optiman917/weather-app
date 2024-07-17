import { Request, Response, Router } from 'express';
import { getWeather } from '../services/weatherService';

const router = Router();

router.post('/weather', async (req: Request, res: Response) => {
  const { city, date } = req.body;

  if (!city || !date) {
    return res.status(400).json({ error: 'City and date are required' });
  }

  try {
    const weatherData = await getWeather(city, date);
    res.json(weatherData);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred.' });
    }
  }
});

export default router;
