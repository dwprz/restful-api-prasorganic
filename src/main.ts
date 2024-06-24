import app from "./apps/application.app";
import "dotenv/config";
import { ConsoleHelper } from "./helpers/console.helper";

const port = process.env.APP_PORT;

app.listen(port, () => {
  ConsoleHelper.log(`app run in port ${port}`);
});
