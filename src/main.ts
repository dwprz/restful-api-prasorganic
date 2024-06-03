import app from "./apps/application.app";
import "dotenv/config";

const port = process.env.APP_PORT;

app.listen(port, () => {
  console.log(`app run in port ${port}`);
});

