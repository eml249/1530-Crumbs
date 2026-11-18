require('dotenv').config();
const connectDB = require('./config/db');
const Building = require('./models/Building');
const Room = require('./models/Room');
const app = require('./app');

const PORT = process.env.PORT || 5001;

connectDB().then(async () => {
  // Sanity check: a wrong database name in READ_MONGODB_URI connects fine but
  // shows empty collections, which is easy to mistake for "no data".
  for (const [label, Model] of [['buildings', Building], ['rooms', Room]]) {
    try {
      const count = await Model.estimatedDocumentCount();
      if (count === 0) {
        console.warn(
          `Warning: the "${label}" collection is empty or missing in this database. ` +
            'Check the database name in READ_MONGODB_URI (the main server uses the default "test" database).',
        );
      } else {
        console.log(`Found ${count} ${label} document(s).`);
      }
    } catch (error) {
      console.warn(`Could not read the "${label}" collection: ${error.message}. Does readUser have read access to this database?`);
    }
  }

  app.listen(PORT, () => console.log(`Viewer server (read-only) running on port ${PORT}`));
});
