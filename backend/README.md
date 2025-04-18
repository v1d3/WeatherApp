# AppDeClima Rest API Backend
This is the backend for the AppDeClima application, providing RESTful APIs to fetch and manage weather data. It is built with Java Spring Boot and uses Docker for database containerization.

There are not environment varibles management in the project yet so any change must be done in the code.

## Current Features
- Registration and login
- JWT authentication with Spring Security
- Creating and getting weather data

## Requirements
- Java 17
- Docker for database containerization

## Building and Running the Project

To build the project, you need to have Java 17 installed and Docker running. 

You can build the project using the maven wrapper included in the project.

```bash
./mvnw clean package
```

This will create a jar file in the `target` directory that can be run with the following command:

```bash
java -jar target/backend-0.0.1-SNAPSHOT.war
```

This will automatically create the database container and run the application.

## Running the Project without Docker

If you want to run the project without Docker or with another database you can do so by removing the `springboot-docker-compose-support` dependency from the `pom.xml` file and changing the database connection url and credentials on the `application.properties` file:

```xml
<!-- Remove this dependency-->
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-docker-compose</artifactId>
	<scope>runtime</scope>
	<optional>true</optional>
</dependency>
```

```properties
# Change this to your database connection url and credentials
spring.datasource.url=jdbc:postgress://linkToYourDB:PORT/DBName
spring.datasource.username=yourUsername
spring.datasource.password=yourPassword
...
```

## API Endpoints usage
The API endpoints are documented in the code using Swagger. You can access the Swagger UI at [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) after running the application.

The endpoints are also explained below:

### Auth Endpoints
 `POST /api/v1/auth/register`: Register a new user, password is optional, will be set to empty string if not provided. If isAdmin is true then the user will be granted ADMIN role.
```json
{
  "username": "username",
  "password": "password",
  "isAdmin": true
}
```
  
<br>

`POST /api/v1/auth/login`: Login a user, password is optional, will be set to empty string if not provided.
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
`POST /api/v1/weather`: Create a new weather data entry, only available for ADMIN role. Request body:
```json
{
  "name": "rainy",
  "dateTime": "2023-10-01T12:00:00Z",
  "location": "corolen",
}
```
<br>

`GET /api/v1/weather`: Get all weather data entries, requires authentication. You can filter by `location` and `dateTime` using query parameters:

```http
GET /api/v1/weather?&location=foo&dateTime=2023-10-01T12:00:00Z
```

