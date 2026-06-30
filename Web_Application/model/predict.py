import sys, json, joblib, numpy as np, traceback

try:
    # Load model
    xgb_models = joblib.load("model/xgb_models.pkl")

    sample_model = list(xgb_models.values())[0]
    FEATURE_ORDER = list(sample_model.feature_names_in_)

    # Read input
    data = json.loads(sys.stdin.read())

    missing = [f for f in FEATURE_ORDER if f not in data]
    if missing:
        raise ValueError(f"Missing features: {missing}")

    X = np.array([[data[f] for f in FEATURE_ORDER]])

    print("DEBUG BMI:", data["bmi"], file=sys.stderr)

    preds = {}
    for target, model in xgb_models.items():
        preds[target] = float(model.predict(X)[0])

    print(json.dumps(preds))

except Exception as e:
    print(json.dumps({
        "error": str(e),
        "trace": traceback.format_exc()
    }))
