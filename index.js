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

// Models & Sample Data (remove insert if not needed)
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
  process.env.FRONTEND_URL || "https://dashfi-frontend.vercel.app", // Production frontend
  "http://localhost:5173", // Local dev (Vite)
  "http://localhost:3000"  // Local dev (React CRA)
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS to all routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests
/* ===== END CORS CONFIGURATION ===== */

// ROUTES
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

    /* Seed Data (run once if needed) */
    // await mongoose.connection.db.dropDatabase();
    // await KPI.insertMany(kpis);
    // await Product.insertMany(products);
    // await Transaction.insertMany(transactions);
  })
  .catch((error) => console.error(`${error} ❌ Database connection failed`));
