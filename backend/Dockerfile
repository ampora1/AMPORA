FROM eclipse-temurin:17-jre

WORKDIR /app

ARG CACHE_BUST
COPY target/*.jar app.jar

RUN echo "Build = $CACHE_BUST"

EXPOSE 8083

ENTRYPOINT ["java","-jar","app.jar"]
