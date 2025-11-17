import { createServer } from "./app";

const port = process.env.PORT || 3000;

const app = createServer();

app.listen(port, () => {
  console.log(`API Tower running on http://localhost:${port}`);
});
