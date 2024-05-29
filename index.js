const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config(); // Load environment variables

// Initialize Firebase Admin SDK using environment variables
admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace escaped newlines
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    universe_domain: process.env.UNIVERSE_DOMAIN
  }),
  databaseURL: 'https://saas-68e2f.firebaseio.com/'
});

const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 5000;

// Rest of your code remains unchanged
// Helper function to add income
async function addIncome(description, amount, category) {
  const status = "Not Approved";
  const uuid = uuidv4(); // Generate a unique ID

  // Add new income document to Firestore
  await admin.firestore().collection('income').add({ uuid, status, description, amount, category });
}


// Endpoint to read data from Firestore
app.get('/api/v1/getData', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('expense').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (error) {
    console.error('Error reading data from Firestore:', error);
    res.status(500).send('Error reading data from Firestore');
  }
});
app.get('/api/v1/getAllBudgetUsages', async (req, res) => {
  try {
    // Fetch all categories from the budget collection
    const budgetsSnapshot = await admin.firestore().collection('budget').get();

    if (budgetsSnapshot.empty) {
      res.status(404).send('No budgets found');
      return;
    }

    const results = [];

    // Process each budget category
    for (const budgetDoc of budgetsSnapshot.docs) {
      const category = budgetDoc.data().name;
      const budget = parseInt(budgetDoc.data().budget,10); // Assuming 'amount' is the field name for budget amount
    
      // Fetch all expenses for the current category
      const expensesSnapshot = await admin.firestore().collection('expense')
        .where('category', '==', category)
        .get();

      let totalExpenses = 0;
      expensesSnapshot.forEach(expenseDoc => {
        totalExpenses +=  parseInt(expenseDoc.data().amount,10); // Assuming 'amount' is the field name for expense amount
      });

      // Calculate the percentage of budget used
      const percentageUsed = (totalExpenses / budget) * 100;

      results.push({
        category,
        totalExpenses,
        budget,
        percentageUsed: percentageUsed.toFixed(2)
      });
    }

    res.json(results);
  } catch (error) {
    console.error('Error calculating budget usage:', error);
    res.status(500).send('Error calculating budget usage');
  }
});

app.get('/api/v1/getInvoice/:start/:end', async (req, res) => {
  try {
    const { start, end } = req.params;
      // Parse the times to Firestore Timestamp objects
    const startTimestamp = admin.firestore.Timestamp.fromDate(new Date(start));
    const endTimestamp = admin.firestore.Timestamp.fromDate(new Date(end));

    // Create a query with the time range
    const snapshot = await admin.firestore().collection('invoice')
      .where('createdAt', '>=', startTimestamp)
      .where('createdAt', '<=', endTimestamp)
      .get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (error) {
    console.error('Error reading data from Firestore:', error);
    res.status(500).send('Error reading data from Firestore');
  }
});


app.get('/api/v1/getIncome/:start/:end', async (req, res) => {
  try {
    const { start, end } = req.params;

    // Parse the times to Firestore Timestamp objects
    const startTimestamp = admin.firestore.Timestamp.fromDate(new Date(start));
    const endTimestamp = admin.firestore.Timestamp.fromDate(new Date(end));

    // Create a query with the time range
    const snapshot = await admin.firestore().collection('income')
      .where('createdAt', '>=', startTimestamp)
      .where('createdAt', '<=', endTimestamp)
      .get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (error) {
    console.error('Error reading data from Firestore:', error);
    res.status(500).send('Error reading data from Firestore');
  }
});
app.get('/api/v1/getExpense/:start/:end', async (req, res) => {
  try {
    const { start, end } = req.params;

    // Parse the times to Firestore Timestamp objects
    const startTimestamp = admin.firestore.Timestamp.fromDate(new Date(start));
    const endTimestamp = admin.firestore.Timestamp.fromDate(new Date(end));

    // Create a query with the time range
    const snapshot = await admin.firestore().collection('expense')
      .where('createdAt', '>=', startTimestamp)
      .where('createdAt', '<=', endTimestamp)
      .get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (error) {
    console.error('Error reading data from Firestore:', error);
    res.status(500).send('Error reading data from Firestore');
  }
});

app.get('/api/v1/getCategories', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('budgets').get();
    const categoriesList = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.name) {
        categoriesList.push(data.name);
      }
    });
    res.json(categoriesList);
  } catch (error) {
    console.error('Error reading data from Firestore:', error);
    res.status(500).send('Error reading data from Firestore');
  }
});

app.get('/api/v1/getTotalExpenses', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('expense').get();
    let totalAmount = 0;

    snapshot.docs.forEach(doc => {
      const expenseData = doc.data();
      if (expenseData.amount) {
        const amount = parseInt(expenseData.amount, 10);
        if (!isNaN(amount)) {
          totalAmount += amount;
        }
      }
    });

    res.json({ totalExpenses: totalAmount });
  } catch (error) {
    console.error('Error reading data from Firestore:', error);
    res.status(500).send('Error reading data from Firestore');
  }
});
app.get('/api/v1/getTotalIncome', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('income').get();
    let totalAmount = 0;

    snapshot.docs.forEach(doc => {
      const incomeData = doc.data();
      if (incomeData.amount) {
        const amount = parseInt(incomeData.amount, 10);
        if (!isNaN(amount)) {
          totalAmount += amount;
        }
      }
    });

    res.json({ totalIncome: totalAmount });
  } catch (error) {
    console.error('Error reading data from Firestore:', error);
    res.status(500).send('Error reading data from Firestore');
  }
});


// Endpoint to read data from Firestore
app.get('/api/v1/getBudget', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('budget').get();
    const data = snapshot.docs.map(doc => doc.data());
    res.json(data);
  } catch (error) {
    console.error('Error reading data from Firestore:', error);
    res.status(500).send('Error reading data from Firestore');
  }
});

app.get('/api/v1/getIncomeCat', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('incomeCat').get();
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
app.post('/api/v1/addExpense', async (req, res) => {
  try {
     const { description, amount, category } = req.body;
    const status = "Not Approved"
     const uuid = uuidv4(); // Generate a unique ID
    const createdAt = admin.firestore.FieldValue.serverTimestamp()
    
    // Assuming the data to be written is sent in the request body
    await admin.firestore().collection('expense').add({uuid, description, amount, category, status , createdAt});
    res.status(201).send('Expense added successfully');
  } catch (error) {
    console.error('Error adding new expense to Firestore:', error);
    res.status(500).send('Error adding new expense to Firestore');
  }
});
app.post('/api/v1/addCategory', async (req, res) => {
  try {
     const { id, name, budget } = req.body;
    const uuid = uuidv4(); // Generate a unique ID
    // Assuming the data to be written is sent in the request body
    await admin.firestore().collection('budget').add({ uuid, name, budget  });
    res.status(201).send('Expense added successfully');
  } catch (error) {
    console.error('Error adding new category to Firestore:', error);
    res.status(500).send('Error adding new expense to Firestore');
  }
});

  app.post('/api/v1/addIncomeCategory', async (req, res) => {
  try {
     const {  name } = req.body;
     const uuid = uuidv4(); // Generate a unique ID
    // Assuming the data to be written is sent in the request body
    await admin.firestore().collection('incomeCat').add({ uuid, name });
    res.status(201).send('Expense added successfully');
  } catch (error) {
    console.error('Error adding new category to Firestore:', error);
    res.status(500).send('Error adding new expense to Firestore');
  }
});

app.post('/api/v1/addIncome', async (req, res) => {
  try {
    const { description,amount, category } = req.body;
     const status = "Not Approved"
     const uuid = uuidv4(); // Generate a unique ID
    const createdAt = admin.firestore.FieldValue.serverTimestamp()
    // Assuming the data to be written is sent in the request body
    await admin.firestore().collection('income').add({ uuid, status,description,amount, category, createdAt});
    res.status(201).send('Income added successfully');
  } catch (error) {
    console.error('Error adding new income to Firestore:', error);
    res.status(500).send('Error adding new income to Firestore');
  }
});

app.post('/api/v1/addInvoice', async (req, res) => {
  try {
    const { description,amount, name } = req.body;
     const status = "Not Paid"
     const uuid = uuidv4(); // Generate a unique ID
     const createdAt = admin.firestore.FieldValue.serverTimestamp()
    // Assuming the data to be written is sent in the request body
    await admin.firestore().collection('invoice').add({ uuid, status,description,amount, name, createdAt });
    res.status(201).send('Invoice added successfully');
  } catch (error) {
    console.error('Error adding new invoice to Firestore:', error);
    res.status(500).send('Error adding new invoice to Firestore');
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

app.put('/api/v1/updateExpense/:id', async (req, res) => {
  try {
    const { id } = req.params; // Extract ID from URL parameters
    const expenseRef = admin.firestore().collection('expense').doc(id);
    const status = "Approved";

    // Check if the expense document exists
    const doc = await expenseRef.get();
    if (!doc.exists) {
      return res.status(404).send('Expense not found');
    }

    // Update the expense document
    await expenseRef.update({ status });
    res.status(200).send('Expense updated successfully');
  } catch (error) {
    console.error('Error updating expense in Firestore:', error);
    res.status(500).send('Error updating expense in Firestore');
  }
});


app.put('/api/v1/updateIncome/:id', async (req, res) => {
  try {
    const { id } = req.params; // Extract ID from URL parameters
    const expenseRef = admin.firestore().collection('income').doc(id);
    const status = "Approved";

    // Check if the expense document exists
    const doc = await expenseRef.get();
    if (!doc.exists) {
      return res.status(404).send('Income not found');
    }

    // Update the expense document
    await expenseRef.update({ status });
    res.status(200).send('Income updated successfully');
  } catch (error) {
    console.error('Error updating expense in Firestore:', error);
    res.status(500).send('Error updating expense in Firestore');
  }
});

// Endpoint to update an invoice and add income
app.put('/api/v1/updateInvoice/:id', async (req, res) => {
  try {
    const { id } = req.params; // Extract ID from URL parameters
    const invoiceRef = admin.firestore().collection('invoice').doc(id);
    const status = "Paid";
  
    // Check if the invoice document exists
    const doc = await invoiceRef.get();
    if (!doc.exists) {
      return res.status(404).send('Invoice not found');
    }

    // Extract amount, description, and category from the invoice document
    const invoiceData = doc.data();
    const description = invoiceData.description || 'No description provided';
    const amount = invoiceData.amount || 0;
    const category = invoiceData.category || 'Invoice';

    // Update the invoice document
    await invoiceRef.update({ status });

    // Call the addIncome function after updating the invoice
    await addIncome(description, amount, category);

    res.status(200).send('Invoice updated and income added successfully');
  } catch (error) {
    console.error('Error updating invoice or adding income in Firestore:', error);
    res.status(500).send('Error updating invoice or adding income in Firestore');
  }
});


app.listen(process.env.PORT || port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;

