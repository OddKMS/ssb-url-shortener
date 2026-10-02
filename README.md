#### Intro

In order to get this little project up and running, simply build the dockerimage first and then run it:

```
docker build -f Dockerfile . --tag ssb-url-shortener && \
docker run --rm -p 3000:3000 --ssb-url-shortener
```

If you've got nvm and node you can also spin up the application natively by running these commands:

```
nvm install
npm install
node bin.ts
```
