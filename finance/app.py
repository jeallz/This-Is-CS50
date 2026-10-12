import os
import sqlite3
from datetime import datetime

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import apology, login_required, lookup, usd

app = Flask(__name__)
app.jinja_env.filters["usd"] = usd

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "change-this-secret-key")
Session(app)

db = SQL("sqlite:///finance.db")


def ensure_orders_table():
    """Create the transaction ledger if it does not exist yet."""
    db.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            symbol TEXT NOT NULL,
            shares INTEGER NOT NULL,
            price NUMERIC NOT NULL,
            transacted TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)
    db.execute("CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id)")
    db.execute("CREATE INDEX IF NOT EXISTS orders_symbol_idx ON orders(symbol)")


def positive_integer(value):
    """Return a positive integer, or None if the submitted value is invalid."""
    try:
        if value is None or not str(value).strip():
            return None
        # Reject decimal notation, signs, and other non-digit input.
        value = str(value).strip()
        if not value.isdigit():
            return None
        number = int(value)
        return number if number > 0 else None
    except (TypeError, ValueError):
        return None


def current_cash():
    rows = db.execute("SELECT cash FROM users WHERE id = ?", session["user_id"])
    return float(rows[0]["cash"]) if rows else 0.0


@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/")
@login_required
def index():
    """Show portfolio, current prices, cash, and total value."""
    ensure_orders_table()
    holdings = db.execute("""
        SELECT symbol, SUM(shares) AS shares
        FROM orders
        WHERE user_id = ?
        GROUP BY symbol
        HAVING SUM(shares) > 0
        ORDER BY symbol
    """, session["user_id"])

    portfolio = []
    stock_total = 0.0
    for holding in holdings:
        quote = lookup(holding["symbol"])
        if quote is None:
            # Preserve the holding even if the quote service is temporarily unavailable.
            portfolio.append({
                "symbol": holding["symbol"], "name": holding["symbol"],
                "shares": holding["shares"], "price": None, "total": None
            })
            continue
        price = float(quote["price"])
        value = int(holding["shares"]) * price
        stock_total += value
        portfolio.append({
            "symbol": quote["symbol"], "name": quote["name"],
            "shares": int(holding["shares"]), "price": price, "total": value
        })

    cash = current_cash()
    return render_template(
        "index.html", stocks=portfolio, cash=cash,
        stock_total=stock_total, grand_total=cash + stock_total
    )


@app.route("/buy", methods=["GET", "POST"])
@login_required
def buy():
    """Buy shares of stock."""
    if request.method == "GET":
        return render_template("buy.html")

    symbol = request.form.get("symbol", "").strip()
    if not symbol:
        return apology("must provide stock symbol")
    quote = lookup(symbol)
    if quote is None:
        return apology("invalid stock symbol")

    shares = positive_integer(request.form.get("shares"))
    if shares is None:
        return apology("shares must be a positive integer")

    price = float(quote["price"])
    cost = shares * price
    cash = current_cash()
    if cost > cash + 1e-9:
        return apology("can't afford that many shares")

    ensure_orders_table()
    db.execute("UPDATE users SET cash = cash - ? WHERE id = ?", cost, session["user_id"])
    db.execute(
        "INSERT INTO orders (user_id, symbol, shares, price, transacted) VALUES (?, ?, ?, ?, ?)",
        session["user_id"], quote["symbol"], shares, price,
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    flash("Purchase completed.")
    return redirect("/")


@app.route("/history")
@login_required
def history():
    """Show all stock transactions for the logged-in user."""
    ensure_orders_table()
    transactions = db.execute("""
        SELECT symbol, shares, price, transacted
        FROM orders
        WHERE user_id = ?
        ORDER BY id DESC
    """, session["user_id"])
    for transaction in transactions:
        transaction["type"] = "BUY" if transaction["shares"] > 0 else "SELL"
        transaction["shares"] = abs(int(transaction["shares"]))
    return render_template("history.html", transactions=transactions)


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in."""
    if request.method == "GET":
        session.clear()
        return render_template("login.html")

    username = request.form.get("username", "").strip()
    password = request.form.get("password", "")
    if not username:
        return apology("must provide username", 403)
    if not password:
        return apology("must provide password", 403)

    rows = db.execute("SELECT * FROM users WHERE username = ?", username)
    if len(rows) != 1 or not check_password_hash(rows[0]["hash"], password):
        return apology("invalid username and/or password", 403)

    session["user_id"] = rows[0]["id"]
    return redirect("/")


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")


@app.route("/quote", methods=["GET", "POST"])
@login_required
def quote():
    """Look up a stock quote."""
    if request.method == "GET":
        return render_template("quote.html")

    symbol = request.form.get("symbol", "").strip()
    if not symbol:
        return apology("must provide stock symbol")
    result = lookup(symbol)
    if result is None:
        return apology("invalid stock symbol")
    return render_template("quoted.html", stock=result)


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register a new user."""
    if request.method == "GET":
        return render_template("register.html")

    username = request.form.get("username", "").strip()
    password = request.form.get("password", "")
    confirmation = request.form.get("confirmation", "")

    if not username:
        return apology("must provide username")
    if not password:
        return apology("must provide password")
    if not confirmation:
        return apology("must confirm password")
    if password != confirmation:
        return apology("passwords do not match")

    try:
        user_id = db.execute(
            "INSERT INTO users (username, hash) VALUES (?, ?)",
            username, generate_password_hash(password)
        )
    except (ValueError, sqlite3.IntegrityError):
        return apology("username already exists")

    session.clear()
    session["user_id"] = user_id
    flash("Account created successfully.")
    return redirect("/")


@app.route("/sell", methods=["GET", "POST"])
@login_required
def sell():
    """Sell shares currently owned by the user."""
    ensure_orders_table()
    if request.method == "GET":
        holdings = db.execute("""
            SELECT symbol, SUM(shares) AS shares
            FROM orders
            WHERE user_id = ?
            GROUP BY symbol
            HAVING SUM(shares) > 0
            ORDER BY symbol
        """, session["user_id"])
        return render_template("sell.html", holdings=holdings)

    symbol = request.form.get("symbol", "").strip().upper()
    if not symbol:
        return apology("must select a stock")
    shares = positive_integer(request.form.get("shares"))
    if shares is None:
        return apology("shares must be a positive integer")

    rows = db.execute("""
        SELECT SUM(shares) AS shares
        FROM orders
        WHERE user_id = ? AND symbol = ?
    """, session["user_id"], symbol)
    owned = int(rows[0]["shares"] or 0)
    if owned <= 0:
        return apology("you do not own this stock")
    if shares > owned:
        return apology("you do not own that many shares")

    quote = lookup(symbol)
    if quote is None:
        return apology("could not retrieve current stock price")
    price = float(quote["price"])
    proceeds = shares * price

    db.execute("UPDATE users SET cash = cash + ? WHERE id = ?", proceeds, session["user_id"])
    db.execute(
        "INSERT INTO orders (user_id, symbol, shares, price, transacted) VALUES (?, ?, ?, ?, ?)",
        session["user_id"], symbol, -shares, price,
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    flash("Sale completed.")
    return redirect("/")


@app.route("/add_cash", methods=["GET", "POST"])
@login_required
def add_cash():
    """Personal touch: allow users to add simulated cash to their account."""
    if request.method == "GET":
        return render_template("add_cash.html", cash=current_cash())

    raw_amount = request.form.get("amount", "").strip()
    try:
        amount = float(raw_amount)
        if not raw_amount or not (amount > 0) or amount == float("inf") or amount != amount:
            raise ValueError
        # Keep currency input to cents.
        amount = round(amount, 2)
        if amount <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return apology("amount must be a positive number")

    db.execute("UPDATE users SET cash = cash + ? WHERE id = ?", amount, session["user_id"])
    flash(f"{usd(amount)} added to your simulated cash balance.")
    return redirect("/")
