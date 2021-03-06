const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');

const mongo = process.env.DATABASE_URL ? process.env.DATABASE_URL : 'mongodb://localhost/spacework';
mongoose.connect(mongo, { useUnifiedTopology: true, useNewUrlParser: true });

const photoSchema = mongoose.Schema({
  id: Number,
  workspaceId: Number,
  description: String,
  url: String,
});
const Photo = mongoose.model('Photo', photoSchema);

const getAllPhotos = async () => await Photo.find({}).exec();

const getPhotoById = async id => await Photo.findOne({ id });

const getPhotosByWorkspaceId = async workspaceId => await Photo.find({ workspaceId }).exec();

const deletePhotosByWorkspaceId = async (workspaceId) => await Photo.deleteMany(workspaceId);

const replacePhotosByWorkspaceId = async (workspaceId, newPhotos) => {
  try {
    await deletePhotosByWorkspaceId({ workspaceId });
    await Photo.create(newPhotos);
    return(null);
  } catch {
    return(new Error('error inserting photos'));
  }
}


module.exports = {
  Photo,
  getAllPhotos,
  getPhotoById,
  getPhotosByWorkspaceId,
  deletePhotosByWorkspaceId,
  replacePhotosByWorkspaceId
};

