const http = require("http");

const app = require("./app");
const config = require("./config");
const connetDatabase = require("./db/connection");

const server = http.createServer(app);

connetDatabase();

process.on("uncaughtException", (error) => {
  console.log("ERROR :" + error.stack);
  console.log("Server is going down due to uncaught exception.");
  process.exit(1);
});

server.listen(config.port, async () => {
  console.log(("Server is running on port: "), config.port);
  // cronJobScheduler(!config.isProduction); // run cron jobs only in production environment
});

process.on("unhandledRejection", (error) => {
  console.log("ERROR :" + error.stack);
  server.close(() => {
    process.exit(1);
  });
  console.log(
    ("Server is going down due to unhandled promise rejection.")
  );
});

module.exports = app;
