FROM openjdk:17-jdk-alpine

WORKDIR /app
COPY . /app
RUN sed -i -e 's/\r$//' gradlew
RUN chmod +x gradlew
RUN ./gradlew clean build
RUN mv build/libs/fmp.alloy.api-0.0.1.jar app.jar
EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]