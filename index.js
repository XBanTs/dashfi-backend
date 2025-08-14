import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

// Routes
import kpiRoutes from "./routes/kpi.js";
import productRoutes from "./routes/product.js";
import transactionRoutes from "./routes/transaction.js";

dotenv.config();
const app = express();

/* ---------- Core middleware ---------- */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));

/* ---------- CORS (production-safe) ---------- */
const allowedExactOrigins = [
  // Primary frontend URL (set this in Render env). No trailing slash.
  process.env.FRONTEND_URL,
  // Optionally allow a few more explicit origins via env
  process.env.FRONTEND_URL_2,
  process.env.FRONTEND_URL_3,
  // Local dev
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:9000",
  "http://localhost:1337",
].filter(Boolean);

// normalize helper
const normalize = (o) => (o ? o.replace(/\/$/, "") : o);

// allow any Vercel preview/prod subdomain for this project
const isVercelPreview = (o) => {
  try {
    const hostname = new URL(o).hostname;
    return hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

// allow additional origins via comma-separated env
const extraCors = (process.env.EXTRA_CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman/cURL/server-to-server
    const orig = normalize(origin);
    const okExact =
      allowedExactOrigins.map(normalize).includes(orig) ||
      extraCors.map(normalize).includes(orig);

    if (okExact || isVercelPreview(orig)) {
      return callback(null, true);
    }
    console.warn(`❌ CORS blocked origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
// CORS middleware automatically handles preflight requests (OPTIONS)
// No need for explicit app.options() with Express 5

/* ---------- Healthcheck (nice for debugging) ---------- */
app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", service: "dashfi-backend" });
});
app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

/* ---------- API routes ---------- */
app.use("/kpi", kpiRoutes);             // GET /kpi/kpis
app.use("/products", productRoutes);    // GET /products/products
app.use("/transaction", transactionRoutes); // GET /transaction/transactions

/* ---------- DB + Server ---------- */
// On Render, DO NOT hardcode a port. Use process.env.PORT.
// Render will set PORT dynamically (you saw 10000 in logs).
const PORT = process.env.PORT || 9000;

mongoose
  .connect(process.env.MONGO_URL, {
    // these options are harmless with newer drivers; fine to keep/remove
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });


 // Optional: seed data (uncomment once if needed)
    // await mongoose.connection.db.dropDatabase();
    // await KPI.insertMany(kpis);
    // await Product.insertMany(products);
    // await Transaction.insertMany(transactions);