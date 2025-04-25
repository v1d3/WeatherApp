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
```

Make sure to replace `DATABASE_URL`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, and `JWT_SECRET_KEY` with your actual database connection details and a secret key for JWT signing.

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

`GET /api/v1/weather`: Example request with Authorization header using the token:

```http
GET /api/v1/weather HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Weather Endpoints
`POST /api/v1/weather`: Create a new weather data entry, requires authenticatino and ADMIN role. Request body:
```json
{
  "name": "rainy",
  "dateTime": "2023-10-01T12:00:00Z",
  "location": "corolen",
}
```
<br>

`GET /api/v1/weather`: Get a list of weather data entries, requires authentication. Optional: you can filter by `location` and `dateTime` using query parameters. Returns empty list if no data is found:

```http
GET /api/v1/weather?&location=foo&dateTime=2023-10-01T12:00:00Z HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

