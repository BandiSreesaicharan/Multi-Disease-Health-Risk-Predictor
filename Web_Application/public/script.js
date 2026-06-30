document.getElementById("form").addEventListener("submit", async e => {
  e.preventDefault();

  const emp = document.querySelector('input[name="emp"]:checked').value;
  const eth = document.querySelector('input[name="eth"]:checked').value;
  const gen = document.querySelector('input[name="gen"]:checked').value;

  const data = {
    Age: +age.value,

    education_level: +education.value,
    income_level: +income.value,
    smoking_status: +smoking.value,

    alcohol_consumption_per_week: +alcohol.value,
    physical_activity_minutes_per_week: +activity.value,
    diet_score: +diet.value,
    sleep_hours_per_day: +sleep.value,
    screen_time_hours_per_day: +screen.value,

    family_history_diabetes: fh_diabetes.checked ? 1 : 0,
    hypertension_history: htn.checked ? 1 : 0,
    cardiovascular_history: cvd.checked ? 1 : 0,

    bmi: +bmi.value,
    waist_to_hip_ratio: +waist.value,
    systolic_bp: +sbp.value,
    diastolic_bp: +dbp.value,
    heart_rate: +hr.value,

    cholesterol_total: +chol.value,
    hdl_cholesterol: +hdl.value,
    ldl_cholesterol: +ldl.value,
    triglycerides: +tri.value,

    glucose_fasting: +gf.value,
    glucose_postprandial: +gp.value,
    insulin_level: +ins.value,
    hba1c: +hba1c.value,

    employment_status_Employed: emp === "Employed" ? 1 : 0,
    employment_status_Retired: emp === "Retired" ? 1 : 0,
    employment_status_Student: emp === "Student" ? 1 : 0,
    employment_status_Unemployed: emp === "Unemployed" ? 1 : 0,

    ethnicity_Asian: eth === "Asian" ? 1 : 0,
    ethnicity_Black: eth === "Black" ? 1 : 0,
    ethnicity_Hispanic: eth === "Hispanic" ? 1 : 0,
    ethnicity_Other: eth === "Other" ? 1 : 0,
    ethnicity_White: eth === "White" ? 1 : 0,

    gender_Female: gen === "Female" ? 1 : 0,
    gender_Male: gen === "Male" ? 1 : 0,
    gender_Other: gen === "Other" ? 1 : 0
  };


  const res = await fetch("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });



  const result = await res.json();
  const outputDiv = document.getElementById("result");
  outputDiv.innerHTML = "";

  Object.entries(result).forEach(([key, score]) => {
    const risk = getRiskLevel(score);

    const card = document.createElement("div");
    card.className = "risk-card";
    card.style.borderLeft = `6px solid ${risk.color}`;

    card.innerHTML = `
  <h3>${key.replaceAll("_", " ").toUpperCase()}</h3>

  <div class="progress-container">
    <div 
      class="progress-bar" 
      style="width:${Math.min(score, 100)}%; background:${risk.color}">
    </div>
  </div>

  <p class="score">Score: <strong>${score.toFixed(1)}</strong> / 100</p>

  <p class="level" style="color:${risk.color}">
    Risk Level: <strong>${risk.label}</strong>
  </p>

  <p class="explanation">
    ${explainRisk(key, data)}
  </p>
`;


    outputDiv.appendChild(card);
  });

});

function getRiskLevel(score) {
  if (score < 25) return { label: "Low", color: "#2ecc71" };
  if (score < 50) return { label: "Moderate", color: "#f1c40f" };
  if (score < 75) return { label: "High", color: "#e67e22" };
  return { label: "Very High", color: "#e74c3c" };
}



function explainRisk(target, inputs) {
  const reasons = [];

  if (
    (target.includes("obesity") || target.includes("diabetes") || target.includes("heart")) &&
    inputs.bmi >= 30
  ) {
    reasons.push("high BMI");
  } else if (
    (target.includes("obesity") || target.includes("diabetes")) &&
    inputs.bmi >= 25
  ) {
    reasons.push("overweight BMI");
  }

  if (
    (target.includes("diabetes") || target.includes("heart")) &&
    (inputs.glucose_fasting >= 126 || inputs.hba1c >= 6.5)
  ) {
    reasons.push("elevated blood sugar");
  }

  if (
    (target.includes("hypertension") || target.includes("heart")) &&
    (inputs.systolic_bp >= 140 || inputs.diastolic_bp >= 90)
  ) {
    reasons.push("high blood pressure");
  }

  if (
    (target.includes("cholesterol") || target.includes("heart")) &&
    inputs.ldl_cholesterol >= 160
  ) {
    reasons.push("high LDL cholesterol");
  }

  if (inputs.family_history_diabetes && target.includes("diabetes")) {
    reasons.push("family history of diabetes");
  }

  if (inputs.hypertension_history && target.includes("hypertension")) {
    reasons.push("previous hypertension history");
  }

  if (inputs.systolic_bp >= 120 && inputs.systolic_bp < 140) {
    reasons.push("borderline systolic blood pressure");
  }

  if (inputs.bmi >= 23 && inputs.bmi < 25) {
    reasons.push("upper-normal BMI");
  }

  if (inputs.glucose_fasting >= 100 && inputs.glucose_fasting < 126) {
    reasons.push("borderline fasting glucose");
  }


  if (reasons.length === 0) {
    return "No major risk factors detected.";
  }

  return "Main contributing factors: " + reasons.join(", ") + ".";
}


