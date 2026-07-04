FROM maven:3.8.6-openjdk-8 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:8-jre
WORKDIR /app
COPY --from=build /app/target/backend-1.0.jar app.jar

CMD ["java", "-jar", "app.jar"]