FROM openjdk:21-slim


# Install Maven
RUN apt-get update && \
  apt-get install -y maven
COPY ./lib/ /home/lib/
COPY ./src/ /home/src/
COPY pom.xml /home/
WORKDIR /home/
RUN mvn clean install


EXPOSE 8080
# preferIPv4Stack is needed to keep wildfly-swarm happy
# add-opens is needed by thontail to allow reflection on java.lang that are restricted by default in Java 9 and later.
ENTRYPOINT ["java", "-Djava.net.preferIPv4Stack=true", "--add-opens", "java.base/java.lang=ALL-UNNAMED", "-jar", "/home/target/alloy-api-thorntail.jar"]
