# AppDeClima Rest API Backend
This is the backend for the AppDeClima application, providing RESTful APIs to fetch and manage weather data. It is built with Java Spring Boot and uses Docker for database containerization.

There are not environment variables management in the project yet so any change must be done in the code.

## Current Features
- Registration and login
- JWT authentication with Spring Security
- Creating and getting weather data

## Requirements
- Java 17
- Optional: Docker if you want to run on a local database

## Getting Started
To get started with the project, you need to set up environment variables for the database connection and JWT secret key.
You have to use the following commands:

Create the `application-secrets.properties` file on the `src/main/resources` directory:
```bash
touch src/main/resources/application-secrets.properties
```
And set up the following properties in the file:

```properties
# Database credentials
spring.datasource.url=jdbc:postgresql:DATABASE_URL/DATABASE_NAME
spring.datasource.username=DATABASE_USERNAME
spring.datasource.password=DATABASE_PASSWORD

# JWT secret key for signing tokens
jwt.secret=JWT_SECRET_KEY

# OpenWeatherMap API key
weather.api.key=OPENWEATHER_API_KEY
```

Make sure to replace `DATABASE_URL`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET_KEY`, `OPENWEATHER_API_KEY` with your actual values for the database connection, JWT secret key, and OpenWeatherMap API key.

## Running the Project

Once you have set up the environment variables, you can run the project by executing the following command:

```bash
./mvnw spring-boot:run
```

This will start the application on `http://localhost:8080` by default.

## Building the Project

If you want to build the project and create a war file, you can do so by running the following command:

```bash
./mvnw clean package -DskipTests=true
```

This will create a war file in the `target` directory that can be run with the following command by default:

```bash
java -jar target/backend-0.0.2-SNAPSHOT.war
```
Change the version number if you are using a different one.

## Running the Project with Docker

If you want, you can use the docker compose support dependency to automatically create a PostgreSQL database container. To do this, you need to add the following dependency to your `pom.xml` file:

```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-docker-compose</artifactId>
	<scope>runtime</scope>
	<optional>true</optional>
</dependency>
```

This will create a PostgreSQL database container with the credentials specified in the `compose.yaml` file.
Remember to update your `application-secrets.properties` file with the database connection details.

Then you can run the project with the following command:

```bash
./mvnw spring-boot:run
```

Note: the docker compose dependency only works with the `spring-boot:run` command, so you cannot use it with the `java -jar` command.

## API Endpoints usage
The API endpoints are documented in the code using Swagger. You can access the Swagger UI at [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) after running the application.

The endpoints are also explained below:

### Auth Endpoints
 `POST /api/v1/auth/register`: Register a new user. If isAdmin is set to true then the user will be granted ADMIN role.
```json
{
  "username": "username",
  "password": "password",
  "isAdmin": true
}
```

<br>

`POST /api/v1/auth/login`: Login
```json
{
  "username": "username",
  "password": "password"
}
```
This will return a JWT token for authentication:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  "type": "Bearer"
}
```
This token must be added to the `Authorization` header of all requests that require authentication:

Example request with Authorization header using the token:

```http
GET /api/v1/weather HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Note: the token includes the user username as `sub` claim, and the `roles` claim that contains the user roles. 

### Forecast Endpoints

`GET /api/v1/forecast/city?name={cityName}`:  
Get the 5-day weather forecast for a specific city in Chile.
**Requires authentication.**  
**Query parameters:**  
- `name` (required): The name of the city (e.g, `name=santiago`).

**Example:**  
`GET /api/v1/forecast/city?name=Santiago`

**Response:**

Returns a JSON object with a `dailyForecast` property.  
Each key is a date (`YYYY-MM-DD`) and its value is the forecast for that day, which includes:

- `hourlyForecasts`: Map of hour (`HH:mm:ss`) to weather data for that hour.
- `minTemperature` / `maxTemperature`: Minimum and maximum temperature for the day.
- `primaryWeather`: The most relevant weather condition for the day in the hour range: 9a.m - 10p.m.
- `dateLocalCL`: The date in Chilean local time.

Each hourly forecast contains:
- `unixTime`: Timestamp in seconds.
- `weather`: Main weather condition (e.g., "Rain", "Clouds").
- `description`: Detailed weather description.
- `temperature`: Temperature in Celsius.
- `precipitation`: Probability of precipitation (0–1, or -1 if not available).
- `humidity`: Humidity percentage.
- `windSpeed`: Wind speed in m/s.
- `icon`: Weather icon code.
- `timestampUTC`: ISO-8601 UTC timestamp.
- `timeLocalCL`: Local time in Chile (`HH:mm:ss`).

**Example response:**
```json
{
  "dailyForecast": {
    "2025-05-31": {
      "hourlyForecasts": {
        "14:44:02": {
          "unixTime": 1748717042,
          "weather": "Clouds",
          "description": "broken clouds",
          "temperature": 26.98,
          "precipitation": -1.0,
          "humidity": 83,
          "windSpeed": 5.8,
          "icon": "04n",
          "timestampUTC": "2025-05-31T18:44:02Z",
          "timeLocalCL": "14:44:02"
        }
        // ... more hours ...
      },
      "minTemperature": 26.88,
      "maxTemperature": 27.01,
      "primaryWeather": {
        "unixTime": 1748725200,
        "weather": "Rain",
        "description": "light rain",
        "temperature": 26.88,
        "precipitation": 0.24,
        "humidity": 83,
        "windSpeed": 6.22,
        "icon": "10n",
        "timestampUTC": "2025-05-31T21:00:00Z",
        "timeLocalCL": "17:00:00"
      },
      "dateLocalCL": "2025-05-31"
    }
    // ... more days ...
  }
}
```

### [DEPRECATED] Weather Endpoints
`GET /api/v1/weather`: Gets all weather entries, requiere authentication. Returns a list. Example response:
```json
[
  {
    id: 1,
    name: "rainy"
  }
]
```

<br>

`POST /api/v1/weather-data`: Create a new weather data entry, requires authentication and ADMIN role. Request body:
```json
{
  "name": "rainy",
  "weatherId": 1, 
  "dateTime": "2023-10-01T12:00:00Z",
  "location": "corolen",
  "temperature": 5.1,
  "humidity": 50,
  "windSpeed": 10.5,
}
```
<br>

`GET /api/v1/weather-data`: Get a list of weather data entries, requires authentication. Optional: you can filter by `location` and `dateTime` using query parameters. Returns empty list if no data is found. Example response:
```json
[
  {
    id: 1,
    weather: {
      id: 1,
      name: "rainy"
    },
    dateTime: "2023-10-01T12:00:00Z",
    location: "corolen",
    temperature: 5.1,
    humidity: 50,
    windSpeed: 10.5
  }
]
```

### Activity Endpoints
`GET /api/v1/activity`: Get all activity entries, requires authentication. Optional: you can filter by `weatherName` using query parameters, this will get all 
activities that has that weather associated. Returns a list. Example Response:
```json
[
  {
    id: 1,
    name: "running",
    weathers: [
      {
        id: 2,
        name: "sunny"
      }
    ]
  }
]
```

`POST /api/v1/activity`: Create a new activity entry, requires authentication and ADMIN role. Request body:
```json
{
  "name": "swimming",
  "weatherIds": [1, 2]
}
```