## 1.0.0-SNAPSHOT (2023-12-26)

- Upgrade from Wildfly swarm to Thorntail. See: https://thorntail.io/posts/the-end-of-an-era/
- Upgrade compatibility with Java 11
- Upgrade maven.
  - latest maven (3.5+) does not support wildfly swarm. 
  - migration: [`mvn io.thorntail:thorntail-maven-plugin:2.7.0.Final:migrate-from-wildfly-swarm`](https://stackoverflow.com/questions/55117508/problem-executing-goal-wildfly-swarm-plugin-api-incompatibility-java-lang-abst)
- Upgrade to latest versions of dependencies
- Because of Java Module System, we need to add `--add-modules java.base/java.lang=ALL-UNNAMED` to the JVM arguments. Thorntail requires reflective access to certain internals of the java.lang package that are restricted by default in Java 9 and later.
- Change docker image to `openjdk:21-slim` (from `FROM openjdk:jdk-alpine` [based on jdk8])