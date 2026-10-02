FROM debian:stable-slim AS base

# We use the '--login' flag in order for the NVM install to populate ~/.bashrc
#
# It is not immediately necessary, but you'll thank me if you have to remote
# in to the container someday.
SHELL ["/bin/bash", "--login",  "-c"]

# Install prerequisites
RUN apt update && apt install -y \
  curl

# We do *not* want to run our Node application as root
RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

COPY --chown=node:node . /url-shortener

WORKDIR /url-shortener

USER node

# This little env dance lets us set and keep certain environment variables
# between RUN commands
ENV HOME=/home/node
ENV BASH_ENV="${HOME}/.bash_env"
RUN touch "${BASH_ENV}"
RUN echo '. "${BASH_ENV}"' >> ~/.bashrc

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh \
  | PROFILE="${BASH_ENV}" bash

RUN nvm install

## TODO: Separate out frontend-base as its own independent image so we don't
## have to install both NVM and Node each build
## (yes, there's caching but it can always be better)
FROM base AS build

RUN npm ci --no-audit --no-fund --loglevel=error

FROM build AS runtime

ENV PORT=3000
EXPOSE $PORT

# --login sources in nvm and npm from ~/.bashrc
ENTRYPOINT [ "/bin/bash", "--login", "-c" ]

# This arrangement lets us change the npm script we want to run on-the-fly
CMD [ "npx ssb-url-shortener" ]
