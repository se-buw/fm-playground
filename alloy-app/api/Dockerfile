FROM openjdk:jdk-alpine

# OPTION 1 - mvn clean install (has to download everything, everytime)
# RUN apk update && apk upgrade && apk add --no-cache maven # use this if it makes sense to update
RUN apk add --no-cache maven
COPY ./lib/ /home/lib/
COPY ./src/ /home/src/
COPY pom.xml /home/
WORKDIR /home/
RUN mvn clean install

# OPTION 2 - do mvn clean install on host machine and then simply copy the "fat jar"
# this might be faster due to local maven cache
# COPY target/alloy4fun-api-swarm.jar /home/target/alloy4fun-api-swarm.jar

EXPOSE 8080
# preferIPv4Stack is needed to keep wildfly-swarm happy
ENTRYPOINT ["java", "-Djava.net.preferIPv4Stack=true", "-jar", "/home/target/alloy-api-swarm.jar"]
