import express from "express";
// import bodyParser from "body-parser"; // No longer needed with Express 4.16+
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet, { crossOriginResourcePolicy } from "helmet";
import morgan from "morgan";
import kpiRoutes from "./routes/kpi.js";
import productRoutes from "./routes/product.js";
import transactionRoutes from "./routes/transaction.js";
import KPI from "./models/KPI.js";
import Product from "./models/Product.js";
import Transaction from "./models/Transaction.js";
import { kpis, products, transactions } from "./data/data.js";

// CONFIGURATIONS
dotenv.config()
const app = express();
app.use(express.json())
app.use(helmet())
app.use(crossOriginResourcePolicy({ policy: "cross-origin" }))
app.use(morgan("common"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// CORS Configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://dashfi-frontend.vercel.app/'] // Replace with your actual Vercel URL
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// ROUTES
app.use("/kpi", kpiRoutes);
app.use("/products", productRoutes);
app.use("/transaction", transactionRoutes);

// MONGOOSE SETUP
const PORT = process.env.PORT || 9000;
mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(async () => {
      app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

      /* ADD DATA ONE TIME ONLY OR AS NEEDED */
      // await mongoose.connection.db.dropDatabase();
      // KPI.insertMany(kpis);
      // Product.insertMany(products);
      // Transaction.insertMany(transactions);
    })
    .catch((error) => console.log(`${error} did not connect`));

