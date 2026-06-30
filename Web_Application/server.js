const express = require("express");
const { spawn } = require("child_process");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.post("/predict", (req, res) => {
    const py = spawn("python", ["model/predict.py"]);

    let output = "";

    py.stdin.write(JSON.stringify(req.body));
    py.stdin.end();

    py.stdout.on("data", data => {
        output += data.toString();
    });

    py.on("close", () => {
        try {
            console.log("Python output:", output);
            res.json(JSON.parse(output));
        } catch (err) {
            res.status(500).json({
                error: "Python returned invalid JSON",
                raw: output
            });
        }
    });
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
