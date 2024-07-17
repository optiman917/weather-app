# Weather App

## Instructions

1. Build and run the application:

```bash
docker build -t weather-app .
docker run -p 8080:8080 weather-app
```

2. Access the API at http://localhost:8080/api/weather.
- Request Body:

    ```json
    {
      "city": "New York",
      "date": "7/17/2024"
    }
    ```

- Response:
    ```json
    {
      "celsius": 40.87,
      "fahrenheit": 105.57
    }
    ```

## Approach
- Used TypeScript and Node.js for the backend.
- Used SQLite with TypeORM for caching.
- Implemented error handling and data conversion.
- Wrote tests using Jest.
- Dockerized the application for easy setup.

### Caching Mechanism

The application uses SQLite to cache weather data by date and city. The cache is stored in a table named `WeatherCache` with the following columns:

- `id`: Primary key
- `city`: The city for which the weather data is fetched
- `date`: The date for which the weather data is fetched
- `celsius`: The temperature in Celsius
- `fahrenheit`: The temperature in Fahrenheit
- `fetchedAt`: The timestamp when the data was fetched

The cache expires after 1 hour to ensure that the data is not outdated. If a cached entry is found and is still valid, it is returned instead of making a new API request.

### Error Handling

The application includes robust error handling for various types of errors:

- **API Rate Limit Exceeded (`429`):** Returns an error message indicating that the rate limit has been exceeded.
- **Request Refused by Server (`418`):** Returns an error message indicating that the request was refused by the server.
- **Internal Server Errors (`500`):** Handles specific error messages such as "City is required", "Date is in the future", and "Invalid date format". For other `500` errors, a generic error message is returned.
- **Other Errors:** A generic error message is returned for any other errors encountered while fetching weather data.


## Assumptions
- The weather API always returns Celsius or Fahrenheit for any random city name, and the application converts the temperature to ensure both values are always returned.
- The cache duration is set to 1 hour, which is suitable based on typical weather patterns, balancing between reducing the number of API requests and ensuring that the weather data is reasonably up-to-date.
