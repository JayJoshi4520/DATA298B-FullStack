FROM node:lts

RUN apt-get update \
    && apt-get install -y --no-install-recommends git openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/local/app
COPY ./setup.sh ./
RUN chmod +x ./setup.sh
CMD ["bash", "./setup.sh"]
