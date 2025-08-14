import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet, { crossOriginResourcePolicy } from "helmet";
import morgan from "morgan";

// Routes
import kpiRoutes from "./routes/kpi.js";
import productRoutes from "./routes/product.js";
import transactionRoutes from "./routes/transaction.js";

// Models & Sample Data (optional seeding)
import KPI from "./models/KPI.js";
import Product from "./models/Product.js";
import Transaction from "./models/Transaction.js";
import { kpis, products, transactions } from "./data/data.js";

// CONFIG
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(express.urlencoded({ extended: false }));

/* ===== CORS CONFIGURATION ===== */
const allowedOrigins = [
  process.env.FRONTEND_URL || "https://dashfi-frontend.vercel.app", // Production
  "http://localhost:5173", // Local dev (Vite)
  "http://localhost:3000"  // Local dev (CRA)
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman or server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`❌ CORS blocked request from: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight
/* ===== END CORS CONFIGURATION ===== */

// ROUTES
app.get("/", (req, res) => {
  res.status(200).json({ status: "Backend is running" });
});
app.use("/kpi", kpiRoutes);
app.use("/products", productRoutes);
app.use("/transaction", transactionRoutes);

// DATABASE CONNECTION
const PORT = process.env.PORT || 9000;

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    app.listen(PORT, () => console.log(`✅ Server running on port: ${PORT}`));

    // Seed data if needed (run once)
    // await mongoose.connection.db.dropDatabase();
    // await KPI.insertMany(kpis);
    // await Product.insertMany(products);
    // await Transaction.insertMany(transactions);
  })
  .catch((error) => console.error(`❌ Database connection failed: ${error}`));
