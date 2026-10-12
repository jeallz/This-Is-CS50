from cs50 import SQL
from flask import Flask, redirect, render_template, request

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

db = SQL("sqlite:///birthdays.db")


@app.after_request
def after_request(response):
    """Ensure responses aren't cached."""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        month_value = request.form.get("month", "")
        day_value = request.form.get("day", "")

        try:
            month = int(month_value)
            day = int(day_value)
        except (TypeError, ValueError):
            return "Month and day must be numbers.", 400

        if not name:
            return "Please enter a name.", 400
        if not 1 <= month <= 12:
            return "Month must be between 1 and 12.", 400
        if not 1 <= day <= 31:
            return "Day must be between 1 and 31.", 400

        db.execute(
            "INSERT INTO birthdays (name, month, day) VALUES (?, ?, ?)",
            name,
            month,
            day,
        )
        return redirect("/")

    birthdays = db.execute("SELECT * FROM birthdays ORDER BY month, day, name")
    return render_template("index.html", birthdays=birthdays)
