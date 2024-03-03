const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser'); // Import body-parser middleware

// Initialize Firebase Admin SDK
const serviceAccount = {
  "type": "service_account",
  "project_id": "saas-68e2f",
  "private_key_id": "a9b00cf8d79c5f761b79358f098528a1635c6d74",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDhGIt3z09A9kVx\nlnYY1Dt5dIWzjaHBCmlx6OSzlmQKLakAWPxsmo+qG2kkx1Z4Mq5zw2kThmTQFtSR\nfYX4lDF4ilph3bgBoFPWd5uZnSbHbN0ZeeHnSmd0XWpt0lx+hQbEIUwJWXLGlvmh\n7PgpE7i0e/txaw9lsY1Z7uf0VfZFLk3rqisVXjZcNorGIN6NbgxwQUfvUG9JglHn\nabJKCsjn5fnIglktMw4FKCEsxtRc1JMZ2DGloV7RR5NgojXySkWHfok7h6ar0H5R\nGtJZKk7TC/H2ifwhkzoF9T0IfY9lQoJLQNB+8ZsJXfjKkMMzXbpPx2WZBCj2QBs3\nGoRKqZhFAgMBAAECggEAAfCEc8sF6jbok1Qel6k7YLydp07F2/Jt78aw3ZC4QXOj\n/UmxquQBfZ3urhSyoDwC5NuERQO3TCkoa+ZlO+2shHNnLZOko0XWojSHkx2UAeDy\nrG2pV1bgT9Pl5h32C3R7Qept3YuJH+QZTWIhI2IjQgqjjd1gw8e/yaHXKVA4anvk\nUlLFpHE1lESL0SzkhWT57amAyJkNzHWFK6c6ZU5u10G57ok7rJQI7f0U7ZdDu1Ae\nag8h0N9BOynt98hWtUsi/6MGvW5263d1KE87Ru73VEgRlGg/SliXyyS/2UikbFB4\nsi6nl5rPG5Tu9npSqeCWfZeFM4+dfXuRcYrSIwER2QKBgQD5lq7mj+JoC142OUCc\nr/gob1/NVi0vs05z0GLHWiidNax/zF0+LDaFMGh7r2l6qsK/pRSkm7BdLD7Kh2cC\naQbHgMGlMypBsyWh6oFx1OBoFZ5T+/U2vf7oqwZ6YB59F2JusSyY+dELQKmr9CMi\nNle5fAhtLQBnwWEzuKUTc+9jqQKBgQDm4MuU3g2r+RECjv9MOYplhWa17X7Lf/7R\nblqgGD7jVv8mLIcIbUDPMHHPXu21Akp3Ynuz0qof96VnswYqGDZgbCY8Q8K/AO77\nfBhWLcQsEIyrx2gdiM5rvkvDFVqbphxdzgd5c7FvJ7LbYOVFubORP6L09bZi4Sb4\nBCAUs1+xPQKBgQCmEzXeBO/J+4Z83iu4Fv8xKKq+nxECJHWXapnPvJY5xXU6tGl2\n7UR563QamOW+0dE0ZEwQG+iGluJRMTfBytDP/0Ta/+imPuZTjw8DB3sqxvfLOmQ4\nQMRVXTe6RisDYYQF066xO8l1i1lbKeAW68IDkhypSMB0SaC8Iaj2ALbRwQKBgQC3\nawUxKkvQQNmbn8EAbIIfbyCPDbN6th/ZgAMtRrXHZFjlmeBY+HrRXxo7dZ4A/GXu\nfGXsEUOoi9RzEs2l6YBhj+m8XNS9a19wmUC4TjmYDDnFSnDTbdkXzaFgxXkrSIcm\nmsRjX18qAG7eTBc5EnOuw9CRLReNbHPJ+3UFHQ+7vQKBgAx1I3isGh8Z9mSgLJ7H\nqAWq99+VmULfvGyc1VHfezVLvOEqXi00ptoo44DmhfBlSKzr1mvz1dEtZ0302IGt\n2BpXgzlPEFuNVEX5ukY62OBiMP37Tk1ZAC5XmZT94dqYUDbsbIDKHNe52bBk4das\nGPzQ0Ykb/+xinH3MfzJoQnFv\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-kui9j@saas-68e2f.iam.gserviceaccount.com",
  "client_id": "110656173121420919112",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-kui9j%40saas-68e2f.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://saas-68e2f.firebaseio.com/'
});

const app = express();
app.use(cors());
app.use(bodyParser.json()); // Use body-parser middleware
const port = 5000;

// Endpoint to read data from Firestore
app.get('/api/v1/getData', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('cars').get();
    const data = snapshot.docs.map(doc => doc.data());
    res.json(data);
  } catch (error) {
    console.error('Error reading data from Firestore:', error);
    res.status(500).send('Error reading data from Firestore');
  }
});
app.get('/api/v1/getHotel', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('hotels').get();
    const data = snapshot.docs.map(doc => doc.data());
    res.json(data);
  } catch (error) {
    console.error('Error reading data from Firestore:', error);
    res.status(500).send('Error reading data from Firestore');
  }
});

app.get('/api/v1/getTrips', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('trips').get();
    const data = snapshot.docs.map(doc => doc.data());
    res.json(data);
  } catch (error) {
    console.error('Error reading data from Firestore:', error);
    res.status(500).send('Error reading data from Firestore');
  }
});

// Endpoint to write data (add a new driver) to Firestore
app.post('/api/v1/addDriver', async (req, res) => {
  try {
    const { id, firstName, lastName } = req.body;
    // Assuming the data to be written is sent in the request body
    await admin.firestore().collection('cars').add({ id, firstName, lastName });
    res.status(201).send('Driver added successfully');
  } catch (error) {
    console.error('Error adding new driver to Firestore:', error);
    res.status(500).send('Error adding new driver to Firestore');
  }
});
app.post('/api/v1/addHotel', async (req, res) => {
  try {
    const { id, Name, Address, Rating } = req.body;
    // Assuming the data to be written is sent in the request body
    await admin.firestore().collection('hotels').add({ id, Name, Address, Rating });
    res.status(201).send('Driver added successfully');
  } catch (error) {
    console.error('Error adding new driver to Firestore:', error);
    res.status(500).send('Error adding new driver to Firestore');
  }
});
// Endpoint to add a new trip to Firestore
app.post('/api/v1/addTrip', async (req, res) => {
  try {
    const { driverId, hotelId, startTime, endTime, cost } = req.body;

    // Check if the provided driverId and hotelId exist
    const driverDoc = await admin.firestore().collection('cars').doc(driverId).get();
    const hotelDoc = await admin.firestore().collection('hotels').doc(hotelId).get();

    // Check if either driver or hotel document doesn't exist
   // if (!driverDoc.exists || !hotelDoc.exists) {
    //  return res.status(404).send('Driver or hotel not found');
  //  }

    // Add trip to Firestore
    await admin.firestore().collection('trips').add({
      driverId,
      hotelId,
      startTime,
      endTime,
      cost
    });

    res.status(201).send('Trip added successfully');
  } catch (error) {
    console.error('Error adding new trip to Firestore:', error);
    res.status(500).send('Error adding new trip to Firestore');
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;

