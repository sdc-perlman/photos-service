const https = require('https');
const path = require('path');
const fs = require('fs');

const { Photo } = require('./index.js');

const NUM_RECORDS = 100000;

const randomIntBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

const get = url => {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let result = '';
      res.on('data', data => {
        result += data.toString();
      });
      res.on('end', data => {
        resolve(result);
      });
    }).on('error', error => {
      reject(error);
    });
  });
};

const getHipsum = async (params = { paras: 1 }) => {
  const paramsArray = [];

  for (let param in params) {
    paramsArray.push(`${param}=${params[param]}`);
  }

  const url = `https://hipsum.co/api/?type=hipster-centric&${paramsArray.join('&')}`;
  console.log(url);
  const data = await get(url);
  return JSON.parse(data);
};

const generateData = async () => {
  const images = [];
  let photoId = 1;

  const data = await getHipsum({ paras: NUM_RECORDS });
  console.log('data length', data.length);

  for (let i = 0; i < NUM_RECORDS; i++) {
    const paragraph = data[i % data.length].replace(/\s+/g, ' ');
    const sentences = paragraph.split('. ');

    const firstSentence = sentences.pop().slice(0, -1);
    const words = firstSentence.toLowerCase().split(' ');
    const limit = photoId + randomIntBetween(3, 7);

    for (; photoId < limit; photoId++) {
      const description = words[randomIntBetween(0, words.length - 1)];
      const image = {
        id: photoId,
        workspaceId: i,
        url: `https://rpt25-photos-service.s3-us-west-1.amazonaws.com/photos/${photoId}.jpg`,
        description: capitalize(description),
      };

      images.push(image);
    }
  }

  await Photo.deleteMany({});
  const photos = await Photo.create(images);

  photosLimit = photos.length;

  console.log(`Generated: ${photos.length} photos`);
};

const run = async () => {
  await generateData();
  process.exit();
};

run();

