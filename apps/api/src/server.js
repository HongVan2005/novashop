import "dotenv/config";
import app from "./app.js";

const port = Number(process.env.PORT || 4000);

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

app.listen(port, () => {
  console.log(`NovaShop API running at http://localhost:${port}`);
});
