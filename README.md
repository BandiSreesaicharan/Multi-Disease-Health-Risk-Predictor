# Multi-Disease Health Risk Predictor

## Project Overview
The purpose of this project is to predict continuous risk scores for five major diseases simultaneously from a single patient profile using Machine Learning. The model outputs risk scores in the range of 0–100 for Diabetes, Hypertension, Heart Disease, Obesity, and Cholesterol, enabling multi-disease health risk assessment from structured clinical and demographic data.

The project covers the complete pipeline from data preprocessing, feature engineering, and model training to evaluation, ablation testing, and cross-validation. The best-performing model — XGBoost — was then deployed as a fully interactive web application built with Node.js, Express, and vanilla JavaScript. It was implemented using Python along with XGBoost, PyTorch TabNet, and Scikit-learn.

## Dataset Information
The dataset used is **final_data.csv** — a structured health dataset containing 97,297 patient records with 33 columns covering demographic, lifestyle, clinical, and laboratory features.

| Field | Description |
|-------|-------------|
| Age, gender, ethnicity | Demographic attributes |
| education_level, income_level, employment_status | Socioeconomic attributes |
| smoking_status, alcohol_consumption_per_week | Lifestyle attributes |
| physical_activity_minutes_per_week, diet_score, sleep_hours_per_day | Lifestyle attributes |
| bmi, waist_to_hip_ratio, systolic_bp, diastolic_bp, heart_rate | Clinical measurements |
| cholesterol_total, hdl_cholesterol, ldl_cholesterol, triglycerides | Lab markers |
| glucose_fasting, glucose_postprandial, insulin_level, hba1c | Lab markers |
| family_history_diabetes, hypertension_history, cardiovascular_history | Medical history flags |

### Target Variables:
| Risk Score | Range |
|------------|-------|
| diabetes_risk_score | 0 – 100 |
| hypertension_risk_score | 0 – 100 |
| heart_disease_risk_score | 0 – 100 |
| obesity_risk_score | 0 – 100 |
| cholesterol_risk_score | 0 – 100 |

## Project Approach
This project follows a complete supervised multi-output regression pipeline for simultaneous disease risk prediction.

1) The project starts with **Data Loading and Exploration** where the dataset is inspected for shape, data types, missing values, and statistical summaries using `df.info()` and `df.describe()`
2) **Feature Encoding** was then applied — ordinal encoding was used for smoking_status, education_level, and income_level based on their natural order, while one-hot encoding using `pd.get_dummies()` was applied to employment_status, ethnicity, and gender
3) After encoding, **Feature and Target Separation** was performed — the five risk score columns were defined as targets and all remaining columns were treated as input features
4) The dataset was split into training and testing sets using an **80:20 ratio** with `random_state=42`, followed by **StandardScaler** normalization for the TabNet model
5) **Two models** were trained — a TabNetRegressor with attention-based feature selection and an XGBRegressor trained independently per target disease using a one-model-per-target strategy
6) **Risk Binning** was applied to convert continuous scores into three classes — Low (≤33), Medium (33–66), and High (>66) — and Classification Reports were generated for each disease
7) A **Feature Ablation Test** was run by removing the five key lab features (triglycerides, glucose_fasting, glucose_postprandial, insulin_level, hba1c) to measure their contribution to model performance
8) **5-Fold Cross-Validation** was performed on the XGBoost models to report mean and standard deviation MAE across all targets
9) A **Confidence-Aware Ensemble** was created by combining TabNet and XGBoost predictions with a weighted average (0.6 TabNet + 0.4 XGBoost)
10) The **XGBoost model was selected for deployment** due to its superior evaluation metrics compared to TabNet, and deployed as a fully interactive web application using Node.js and Express

## Why This Pipeline Was Chosen
The pipeline was carefully designed based on the characteristics of structured health data and the multi-output nature of the prediction task.

1) **XGBoost** was selected because it consistently delivers strong performance on tabular data, handles feature interactions effectively, and provides native feature importance scores for interpretability
2) **TabNet** was included because it applies sequential attention to select relevant features at each step of decision-making, making it well-suited for high-dimensional health data with mixed feature types
3) **One-model-per-target strategy** was used for XGBoost because it allows each disease model to independently learn the most relevant feature patterns for its specific risk score
4) **Ordinal encoding** was used for naturally ordered categoricals (smoking, education, income) to preserve their meaningful order, while one-hot encoding was used for nominal categoricals (gender, ethnicity, employment) to avoid introducing false ordinal relationships
5) **Feature Ablation** was performed specifically on lab-only features to quantify whether the model can still generalize when clinical lab tests are unavailable — a practically important real-world scenario
6) **K-Fold Cross-Validation** was added to ensure that the evaluation metrics are stable and not dependent on a single train-test split
7) **XGBoost was chosen for deployment over TabNet** because it produced better MAE and R² scores across all five disease targets, making it the more reliable and accurate model for real-time inference
8) **Node.js with Express** was chosen for the backend because it enables a lightweight REST API that bridges the web frontend with the Python prediction script through a spawned child process, without requiring a full Python web framework

### This pipeline is highly suitable for this project because:
The dataset is large and tabular — XGBoost and TabNet are both well-suited for this format. The multi-output structure benefits from per-target modeling where disease-specific patterns can be captured independently. The ablation test provides actionable insight into which feature groups are most critical. Cross-validation ensures robust and trustworthy reported metrics. Deploying the best model as a web application makes the predictor practically usable without requiring any code or ML knowledge from the end user.

## Machine Learning Workflow
The complete workflow starts with dataset loading and encoding. After feature-target separation and scaling, two models are trained — TabNet and XGBoost. Predictions are evaluated using regression metrics and risk class classification reports. Ablation and cross-validation are performed to validate feature importance and model stability. The XGBoost model, having outperformed TabNet on evaluation metrics, is then deployed as an interactive web application for real-time patient risk scoring.

### The project pipeline follows this flow:
*Data Loading → Exploration → Encoding → Feature-Target Split → Train-Test Split → Feature Scaling → TabNet Training → XGBoost Training → Regression Evaluation → Risk Binning → Classification Reports → Feature Ablation → K-Fold Cross-Validation → Error Analysis → Ensemble → Model Saving → Web Deployment (XGBoost)*

## Label Schema
The project uses a continuous regression output (0–100 risk scores) as primary predictions, with the following risk class binning applied for classification-level evaluation and result display in the web application.

| Risk Class | Score Range | Label ID | Web App Color |
|------------|-------------|----------|---------------|
| Low | 0 – 24 | 0 | 🟢 Green |
| Moderate | 25 – 49 | 1 | 🟡 Yellow |
| High | 50 – 74 | 2 | 🟠 Orange |
| Very High | 75 – 100 | 3 | 🔴 Red |

## Training Configuration

### TabNet
| Parameter | Value |
|-----------|-------|
| Optimizer | Adam |
| Learning Rate | 2e-2 |
| n_d / n_a | 16 |
| n_steps | 5 |
| Gamma | 1.5 |
| Max Epochs | 200 |
| Patience (Early Stopping) | 20 |
| Batch Size | 1024 |
| Virtual Batch Size | 128 |
| Eval Metric | RMSE |

### XGBoost (per target)
| Parameter | Value |
|-----------|-------|
| n_estimators | 300 |
| max_depth | 5 |
| learning_rate | 0.05 |
| subsample | 0.8 |
| colsample_bytree | 0.8 |
| random_state | 42 |

### Ensemble
| Parameter | Value |
|-----------|-------|
| TabNet Weight | 0.6 |
| XGBoost Weight | 0.4 |

## Model Evaluation
Different evaluation metrics were used to measure model performance at both regression and classification levels.

1) **MAE (Mean Absolute Error)** measures the average absolute difference between predicted and actual risk scores — lower is better
2) **RMSE (Root Mean Squared Error)** penalizes large prediction errors more heavily than MAE — reported for TabNet evaluation
3) **R² (Coefficient of Determination)** measures how well the model explains variance in the target — higher is better, with 1.0 being a perfect fit
4) A **per-target Classification Report** was generated using risk-binned predictions to evaluate Precision, Recall, and F1-Score at the Low / Medium / High class level for each disease

**XGBoost outperformed TabNet across all five disease targets on both MAE and R² metrics and was therefore selected as the deployed model for the web application.**

**Token-level or sample-level accuracy was intentionally avoided as R² and MAE provide more meaningful and continuous evaluation for regression tasks.**

## Feature Ablation Test
A dedicated ablation experiment was run by removing the following five lab-only features to simulate a scenario where clinical laboratory tests are unavailable:

| Removed Feature | Type |
|----------------|------|
| triglycerides | Lab marker |
| glucose_fasting | Lab marker |
| glucose_postprandial | Lab marker |
| insulin_level | Lab marker |
| hba1c | Lab marker |

The ablation models were retrained from scratch on the reduced feature set and evaluated on the same test split to measure the performance drop across all five disease targets.

## K-Fold Cross-Validation
5-Fold Cross-Validation was performed on the full dataset using XGBoost models to assess generalization stability.

| Parameter | Value |
|-----------|-------|
| n_splits | 5 |
| shuffle | True |
| random_state | 42 |
| Metric Reported | Mean MAE ± Std MAE per target |

## Deployment — Web Application
The XGBoost model was deployed as a fully interactive web application. XGBoost was selected for deployment over TabNet because it produced superior MAE and R² scores across all five disease targets, making it the more accurate and reliable model for real-time inference.

### Architecture
The application follows a three-layer architecture — a static HTML/CSS/JS frontend, a Node.js Express backend, and a Python prediction script that loads the saved XGBoost models and scaler to serve predictions.

| Layer | Technology | File |
|-------|------------|------|
| Frontend | HTML, CSS, JavaScript | index.html, style.css, script.js |
| Backend | Node.js, Express | server.js |
| Prediction | Python, joblib, XGBoost | model/predict.py |
| Saved Models | joblib | scaler.pkl, xgb_models.pkl |

### How It Works
1) The user fills in their clinical and demographic data through the web form
2) On form submission, the frontend collects all inputs — including one-hot encoded employment, ethnicity, and gender fields — and sends them as a JSON POST request to the `/predict` endpoint
3) The Express server receives the request and spawns a Python child process (`model/predict.py`), passing the JSON payload via stdin
4) The Python script loads `scaler.pkl` and `xgb_models.pkl`, applies the scaler, runs inference across all five XGBoost models, and returns predictions as JSON via stdout
5) The server forwards the JSON response back to the frontend, which renders an individual risk card for each disease

### App Features
* Enter any patient profile through an organized multi-section dashboard form
* Input fields are grouped into Basic Info, Lifestyle, Medical History, Vitals, Lab Values, and Categories sections
* Select Employment Status, Ethnicity, and Gender via radio buttons — automatically one-hot encoded before sending to the model
* Click **Predict** to run all five XGBoost models in real time
* View color-coded risk cards for each disease with a dynamic progress bar, numeric score out of 100, and risk level label
* Each card displays a plain-language explanation of the main contributing risk factors detected from the input values

### Risk Level Color Coding
| Risk Level | Score Range | Color |
|------------|-------------|-------|
| 🟢 Low | 0 – 24 | Green |
| 🟡 Moderate | 25 – 49 | Yellow |
| 🟠 High | 50 – 74 | Orange |
| 🔴 Very High | 75 – 100 | Red |

### Project File Structure
```
project/
│
├── public/
│   ├── index.html         # Main web form UI
│   ├── style.css          # Responsive dashboard styling
│   └── script.js          # Form logic, API call, result rendering
│
├── model/
│   ├── predict.py         # Python inference script
│   ├── scaler.pkl         # Fitted StandardScaler
│   └── xgb_models.pkl     # Five trained XGBRegressor models
│
└── server.js              # Node.js Express server
```

### To Run Locally
```
npm install express
node server.js
```
Then open your browser and go to ***http://localhost:3000***

## Saved Artifacts
| File | Description |
|------|-------------|
| scaler.pkl | Fitted StandardScaler for input normalization |
| tabnet_model | Saved TabNet model (pytorch-tabnet format) |
| xgb_models.pkl | Dictionary of five fitted XGBRegressor models keyed by target name |

## Technologies Used
* Python
* NumPy
* Pandas
* Scikit-learn
* XGBoost
* PyTorch
* pytorch-tabnet
* Matplotlib
* Seaborn
* Node.js
* Express
* HTML / CSS / JavaScript
* Kaggle (Training Environment)

## Real-World Applications
This project demonstrates how multi-output regression can automate simultaneous health risk assessment from a single patient record. Similar systems are actively used in:

* Preventive healthcare and early intervention programs
* Clinical decision support tools for general practitioners
* Insurance risk stratification and premium assessment
* Population health monitoring and chronic disease surveillance
* Personal health apps and wearable health platforms

## Future Improvements
In the future, this project can be improved by:

1) Adding SHAP (SHapley Additive Explanations) values to the web application for per-prediction feature attribution and visual interpretability
2) Extending to more disease targets such as chronic kidney disease, liver disease, and stroke risk
3) Deploying the application to a cloud platform such as Heroku, Railway, or AWS EC2 for public access
4) Adding a PDF or CSV export feature to download the full risk report for a patient
5) Applying advanced hyperparameter optimization using Optuna or Ray Tune for both TabNet and XGBoost
6) Incorporating time-series patient records for longitudinal risk tracking across multiple visits
7) Adding user authentication and a patient history dashboard to track risk score changes over time

## Conclusion
The Multi-Disease Health Risk Predictor successfully demonstrates the complete pipeline for simultaneous multi-output health risk regression using TabNet and XGBoost on structured clinical data, ending with a fully deployed interactive web application. By combining ordinal and one-hot encoding, per-target XGBoost modeling, attention-based TabNet feature selection, risk class binning, feature ablation, K-Fold cross-validation, and a Node.js-powered web deployment of the best-performing model, the system reliably predicts and visually presents continuous risk scores for Diabetes, Hypertension, Heart Disease, Obesity, and Cholesterol from a single patient profile.

The project highlights key machine learning and software engineering concepts including multi-output regression, ensemble learning, feature ablation, cross-validation, regression-to-classification conversion, REST API design, and full-stack web deployment. It serves as a strong practical implementation of end-to-end health risk prediction for real-world clinical and preventive healthcare applications.
