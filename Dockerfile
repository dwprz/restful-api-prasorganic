FROM node:20-alpine

LABEL author="Dwi Prasetiyo"
LABEL project="prasorganic"

WORKDIR /app

EXPOSE 3300

CMD npm run dev


