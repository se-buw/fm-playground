FROM openjdk:17-jdk-alpine

WORKDIR /app
COPY . /app

RUN apk add --no-cache libstdc++
RUN sed -i -e 's/\r$//' gradlew
RUN chmod +x gradlew
RUN ./gradlew clean build -x test 
RUN mv build/libs/fmp.alloy.api-0.0.1.jar app.jar
EXPOSE 8080

ENTRYPOINT ["java","-Djava.library.path=lib/", "-jar","app.jar"]