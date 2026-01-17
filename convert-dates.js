// convert-dates.js
const { MongoClient, ObjectId } = require("mongodb");

async function run() {
  const uri = "mongodb://127.0.0.1:27017";
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db("bus_booking");
    const buses = db.collection("buses");

    const cursor = buses.find({});
    let updated = 0;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();

      // If departureTime exists and is a string, convert it
      if (doc.departureTime && typeof doc.departureTime === "string") {
        const newDate = new Date(doc.departureTime);
        if (!isNaN(newDate.getTime())) {
          await buses.updateOne(
            { _id: doc._id },
            { $set: { departureTime: newDate } }
          );
          updated++;
          console.log(`Updated _id=${doc._id} -> ${newDate.toISOString()}`);
        } else {
          console.warn(`Skipping _id=${doc._id} — invalid date string: ${doc.departureTime}`);
        }
      }
    }

    console.log(`Done. Documents updated: ${updated}`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
