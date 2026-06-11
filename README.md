# 🌾 AgroInsight AI

> A smart crop & profit optimization system for Indian farmers — powered by AI, real market data, and classical algorithms.

![AgroInsight Banner](https://images.pexels.com/photos/326082/pexels-photo-326082.jpeg?auto=compress&cs=tinysrgb&w=1200)

---

## 🚀 Live Demo

- **Frontend:** [agroinsight.vercel.app](https://agroinsight.vercel.app)
- **Backend API:** [agroinsight-backend.onrender.com](https://agroinsight-backend.onrender.com)

---

## 📌 What It Does

AgroInsight AI helps Indian farmers make smarter decisions:

| Feature | Description |
|---|---|
| ⚡ **Crop Optimizer** | Enter your budget & land area → AI picks the most profitable crop combination |
| 🔬 **Crop Scanner** | Upload a photo → AI identifies 300+ Indian crops, detects diseases, suggests treatment |
| 📡 **Live Mandi Prices** | Real daily wholesale prices from 7000+ mandis across India (Agmarknet) |
| 🏪 **Market Recommender** | Finds the best mandi to sell your crops for maximum profit |

---

## 🧠 Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS (glassmorphism UI, animations)
- React Router v6
- Axios

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Sharp (image preprocessing)
- Google Generative AI SDK

### AI / ML
- **Google Gemini 2.5 Flash** — Multimodal Vision AI (crop identification, disease detection)
- **MobileNetV2 + TensorFlow** — Custom CNN training pipeline (PlantVillage dataset)
- **Computer Vision** — Image normalization, pixel channel analysis (brightness, green score, yellow index, necrosis hint)

### Algorithms
- **0/1 Knapsack (Dynamic Programming)** — Optimal crop selection within budget
- **Greedy Algorithm** — Best mandi selection by price score

### External APIs
- **data.gov.in Agmarknet API** — Real daily mandi prices across India
- **Google Gemini API** — Vision AI for crop analysis

### ML Pipeline (Python)
- TensorFlow + Keras
- MobileNetV2 (transfer learning)
- Flask (microservice)
- scikit-learn, Matplotlib, Seaborn

---

## 📁 Project Structure

```
agroinsight/
├── backend/               # Node.js + Express API
│   ├── algorithms/        # Knapsack + Greedy
│   ├── controllers/       # Route handlers
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── services/          # Agmarknet price service
│   ├── utils/             # Image processor (Sharp)
│   └── server.js
├── frontend/              # React + Vite
│   ├── public/crops/      # Local crop images
│   └── src/
│       ├── components/    # ScanResult (accordion UI)
│       └── pages/         # InputPage, ResultPage, ScanPage
├── ml/                    # Python ML pipeline
│   ├── train.py           # MobileNetV2 training
│   ├── predict.py         # Flask inference API
│   ├── preprocess.py      # Dataset preparation
│   └── evaluate.py        # Confusion matrix + metrics
└── data/                  # CSV seed data
```

---

## ⚙️ API Endpoints

```
POST /api/optimize          → Knapsack crop selection + Greedy mandi
POST /api/identify          → Gemini Vision crop scan + live prices
GET  /api/crops             → List all crops in DB
GET  /api/crops/:name       → Full crop details
GET  /api/crops/:name/mandi → Live mandi prices for a crop
```

---

## 🏃 Run Locally

### Prerequisites
- Node.js 18+
- MongoDB running locally
- Git

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/agroinsight.git
cd agroinsight
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Set up environment variables
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env`:
```
MONGO_URI=mongodb://localhost:27017/agroinsight
PORT=5000
GEMINI_API_KEY=your_gemini_key_here
DATA_GOV_API_KEY=your_datagov_key_here
```

### 4. Seed the database
```bash
cd backend
node importData.js
node data/cropInfoSeed.js
```

### 5. Run backend
```bash
cd backend
node server.js
```

### 6. Run frontend (new terminal)
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173`

---

## 🌐 Deploy

### Frontend → Vercel
1. Import repo on [vercel.com](https://vercel.com)
2. Root directory: `frontend`
3. Add env: `VITE_API_URL=https://your-render-backend.onrender.com`

### Backend → Render
1. New Web Service on [render.com](https://render.com)
2. Root directory: `backend`
3. Start command: `node server.js`
4. Add env variables: `MONGO_URI`, `GEMINI_API_KEY`, `DATA_GOV_API_KEY`, `NODE_ENV=production`

### Database → MongoDB Atlas
1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Allow all IPs (0.0.0.0/0)
3. Copy connection string → set as `MONGO_URI`

---

## 🔑 API Keys Required

| Key | Get it from | Free? |
|---|---|---|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) | ✅ Yes |
| `DATA_GOV_API_KEY` | [data.gov.in](https://data.gov.in/user/register) | ✅ Yes |

---

## 📊 How the Algorithms Work

### Knapsack (Crop Selection)
Each crop has a cost and profit. The 0/1 Knapsack DP finds the combination of crops that **maximizes total profit without exceeding budget**.

```
For budget W and n crops:
dp[w] = max profit achievable with budget w
Time: O(n × W)  |  Space: O(n × W)
```

### Greedy (Mandi Selection)
After crops are selected, each mandi is scored by summing its prices for those crops. The highest-scoring mandi is recommended.

---

## 🌱 ML Training (Optional)

To train the custom crop disease model:

```bash
# Install Python dependencies
pip install -r ml/requirements.txt

# Download PlantVillage dataset (requires Kaggle API key)
python ml/preprocess.py

# Train MobileNetV2 (~20 min on CPU)
python ml/train.py

# Start Flask inference service
python ml/predict.py
```

Expected accuracy: ~96% on PlantVillage test set (38 disease classes)

---

## 👨‍💻 Built With

- MERN Stack (MongoDB, Express, React, Node.js)
- Google Gemini Vision AI
- TensorFlow / Keras
- data.gov.in Open Government Data

---

## 📄 License

MIT License — free to use, modify and distribute.
