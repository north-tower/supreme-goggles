const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser'); // Import body-parser middleware

// Initialize Firebase Admin SDK
const serviceAccount = require('./saas.json');
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
    const { id,firstName, lastName } = req.body;
    // Assuming the data to be written is sent in the request body
    await admin.firestore().collection('cars').add({ id,firstName, lastName });
    res.status(201).send('Driver added successfully');
  } catch (error) {
    console.error('Error adding new driver to Firestore:', error);
    res.status(500).send('Error adding new driver to Firestore');
  }
});
app.post('/api/v1/addHotel', async (req, res) => {
  try {
    const { id,Name, Address, Rating } = req.body;
    // Assuming the data to be written is sent in the request body
    await admin.firestore().collection('hotels').add({ id,Name, Address, Rating });
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

