from flask import Flask, request, render_template
from flask_cors import CORS
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

app = Flask(__name__)
CORS(app)

# Load model and tokenizer
model_name = "facebook/blenderbot-400M-distill"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# Conversation memory
conversation_history = []

@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")

@app.route("/chatbot", methods=["POST"])
def handle_prompt():
    try:
        # Get JSON data from frontend
        data = request.get_json()
        input_text = data["prompt"]

        # Limit conversation history to last 6 messages (3 user+3 bot)
        last_history = conversation_history[-6:]
        history_string = " ".join(last_history)

        # Tokenize input + history
        inputs = tokenizer(history_string + " " + input_text, return_tensors="pt")

        # Generate response with sampling to reduce repetition
        outputs = model.generate(
            **inputs,
            max_length=60,
            do_sample=True,
            top_k=50,
            top_p=0.95,
            temperature=0.7,
            no_repeat_ngram_size=3
        )

        # Decode output
        response = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()

        # Update conversation history
        conversation_history.append(f"User: {input_text}")
        conversation_history.append(f"Bot: {response}")

        return response

    except Exception as e:
        # Return error message
        return f"Error: {str(e)}"

if __name__ == "__main__":
    app.run(debug=True)
