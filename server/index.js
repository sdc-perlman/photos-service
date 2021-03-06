const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('../database/index.js');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/api/photos', async (req, res) => {
  const photos = await db.getAllPhotos();
  res.json(photos);
});

app.get('/api/photos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const photo = await db.getPhotoById(id);
    res.json(photo);
  } catch (err) {
    console.error(`No error exits for id: ${id}`);
    res.sendStatus(500);
  }
});

app.get('/api/photos/workspace/:workspaceId', async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const photos = await db.getPhotosByWorkspaceId(workspaceId);
    res.json(photos);
  } catch (err) {
    console.error(`No photos exist for workspaceId: ${workspaceId}`);
    res.sendStatus(500);
  }
});

app.put('/api/photos/workspace/:workspaceId', async (req, res) => {
  //Test with: curl -X "PUT" -d descriptions="['hipster words','more hipster words']" -d urls="['www.facebook.com','www.example.com']" http://localhost:6001/api/photos/workspace/98
  const { workspaceId } = req.params;
  var {descriptions, urls} = req.body;

  descriptions = JSON.parse(descriptions.replace(/'/g, '\"'));
  urls = JSON.parse(urls.replace(/'/g, '\"'));

  var photos = [];
  for (var i = 0; i < descriptions.length; i++) {
    photos.push({
      id: i,
      workspaceId: workspaceId,
      description: descriptions[i],
      url: urls[i]
    })
  }
  try {
    await db.replacePhotosByWorkspaceId(workspaceId, photos);
    res.sendStatus(200);
  } catch {
    console.error(`Error replacing workspace photos`);
    res.sendStatus(500);
  }
})

app.delete('/api/photos/workspace/:workspaceId', async (req, res) => {
  const { workspaceId } = req.params;
  try {
    await db.deletePhotosByWorkspaceId(workspaceId);
    res.sendStatus(200);
  } catch (err) {
    console.error(`Couldn't delete workspaceId ${workspaceId}`);
    res.sendStatus(500);
  }
})

// Fallback to index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const port = process.env.PORT ? process.env.PORT : 6001;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
