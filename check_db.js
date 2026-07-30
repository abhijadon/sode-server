const mongoose = require('mongoose');
const { ApiConfig } = require('./src/model/ApiConfig');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sode-crm");
  const doc = await ApiConfig.findOne({ key: 'brevo_lead_api' });
  console.log(JSON.stringify(doc.bodyParams, null, 2));
  process.exit(0);
}
check();
