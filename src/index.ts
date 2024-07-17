import express from "express";
import { initializeDatabase } from "./utils/database";
import weatherController from "./controllers/weatherController";

const app = express();
const port = 8080;

app.use(express.json());
app.use("/api", weatherController);

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error initializing database:", error);
  });
