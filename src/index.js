import app from "./app.js";
import config from "./config/index.js";
import connectDB from "./database/connection.js";
(async () => {
  try {
    // database connection here
    await connectDB();

    app.on("error", (error) => {
      console.error("ERROR: ", error);
      throw error;
    });

    const onListening = () => {
      console.log(`Server is running on port ${config.PORT}`);
    };
    app.listen(config.PORT, onListening);
  } catch (error) {
    console.error("Error starting the server:", error);
    throw error;
  }
})();
