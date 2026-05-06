# 🧠 DataScoop - Alzheimer's Detection System
### *Integrated Academic Project - Full-Stack & AI Multi-Model Platform*

Welcome to **DataScoop**, a state-of-the-art medical decision support system designed to assist neurologists in the early detection and classification of Alzheimer's Disease using deep learning and multi-model parallel analysis.

---

## 🚀 Executive Summary
DataScoop is an end-to-end industrial-grade platform that bridges the gap between advanced Deep Learning research and clinical practice. By leveraging a **Multi-Model Parallel Inference Engine**, the system provides high-reliability diagnostic suggestions based on MRI image analysis.

### Core AI Philosophy: *Reliability-First Inference*
Instead of relying on a single neural network, DataScoop implements a **Weighted Reliability Score (WRS)**:
$$RS = Confidence \times Benchmark\_Accuracy$$
This approach mitigates the "overconfidence bias" of individual models, ensuring that the final verdict is guided by the most historically accurate and currently confident model.

---

## 🛠️ Technical Architecture

### 1. 🤖 AI & Machine Learning Service (`/ml_service`)
A high-performance Python/Flask microservice that handles the heavy lifting of computer vision analysis.
- **Model Zoo**: Includes ResNet-50, EfficientNet-B0/B3/B4, and custom Alzheimer-specific CNNs.
- **Parallel Inference**: Simultaneous execution across multiple architectures to ensure robust results.
- **Preprocessing Pipeline**: Automated image normalization, resizing, and color space conversion tailored for medical MRI standards.
- **Dynamic Selection**: Real-time ranking of models based on the WRS algorithm.

### 2. ⚡ Backend Engine (`/backend`)
A robust Node.js/Express ecosystem designed for scalability and security.
- **Database**: MongoDB integration for persistent storage of patient records, diagnostic history, and user authentication.
- **Auth System**: Role-based access control (RBAC) separating Doctors, Admins, and Users.
- **Real-time Comms**: Integrated messaging system for doctor-patient collaboration.
- **RESTful API**: Clean, documented endpoints for seamless frontend integration.

### 3. 🎨 Frontend Interface (`/neuro-detect-lab-main`)
A modern, responsive React/TypeScript dashboard focused on User Experience (UX).
- **Medical Dashboard**: Specialized views for MRI uploads, result visualization, and patient management.
- **Data Visualization**: Real-time probability charts and comparative model analysis.
- **Authentication Flow**: Secure login/register with specific doctor-validation keys.

---

## 🧬 Scientific Methodology
The project classifies scans into four distinct stages of Alzheimer’s:
1. **Mild Demented**
2. **Moderate Demented**
3. **Non Demented**
4. **Very Mild Demented**

### Benchmark Performance
| Model Architecture | Benchmark Accuracy | Role in System |
| :--- | :--- | :--- |
| **ResNet-50 (BestModel)** | **89.25%** | Primary Reference |
| **EfficientNet-B0** | 82.00% | Efficiency Baseline |
| **UltraBestModel** | 85.00% | Multi-Architecture Hybrid |
| **AlzheimerCNN** | 75.00% | MRI-Specialized Base |

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- Python (3.9+)
- MongoDB Atlas or Local Instance

### Quick Start
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Abd-Elmouhib-Souri/neuro-detect-lab.git
   ```
2. **Launch the entire stack**:
   Use the provided `run_all.bat` (Windows) or start services individually:
   - **Backend**: `cd backend && npm install && npm start`
   - **ML Service**: `cd ml_service && pip install -r requirements.txt && python app.py`
   - **Frontend**: `cd neuro-detect-lab-main && npm install && npm run dev`

---

## 🎓 Academic Context
This project was developed as an **Integrated Project**, demonstrating proficiency in:
- Full-Stack Software Engineering
- MLOps (Machine Learning Operations)
- Deep Learning for Medical Imaging
- System Architecture & Integration

**Développé par : Abd-Elmouhib Souri**
*Étudiant en 2ème année de cycle d'ingénieur en Data Science & AI*

---
*Disclaimer: This tool is for educational and research purposes only. All clinical decisions must be made by qualified medical professionals.*
