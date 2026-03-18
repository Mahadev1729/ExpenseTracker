import { useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import API from "../services/api";

function ExpenseForm({ refresh }) {
  const [expense, setExpense] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: "",
    notes: "",
  });

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const startListening = () => SpeechRecognition.startListening({ continuous: true });

  const stopListening = () => SpeechRecognition.stopListening();

  const processVoice = () => {
    const text = transcript.toLowerCase();
    let amount = "";
    let category = "Others";
    let title = "";

    const amountMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
    if (amountMatch) {
      amount = amountMatch[1];
    }

    if (text.includes("food") || text.includes("groceries") || text.includes("dining")) {
      category = "Food";
    } else if (text.includes("travel") || text.includes("transport")) {
      category = "Travel";
    } else if (text.includes("shopping") || text.includes("clothes")) {
      category = "Shopping";
    } else if (text.includes("bills") || text.includes("utilities")) {
      category = "Bills";
    }

    const titleMatch = text.match(/(?:for|at)\s+(.+)/);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    const today = new Date().toISOString().split('T')[0];

    setExpense({
      ...expense,
      title: title || expense.title,
      amount: amount || expense.amount,
      category,
      date: today,
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    await API.post("/expenses", expense);

    refresh();
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <div className="mb-4">
        <button
          onClick={listening ? stopListening : startListening}
          className="bg-green-500 text-white px-4 py-2 mr-2"
        >
          {listening ? "Stop Listening" : "🎤 Voice Input"}
        </button>
        <button
          onClick={processVoice}
          className="bg-blue-500 text-white px-4 py-2 mr-2"
        >
          Process Voice
        </button>
        <button
          onClick={resetTranscript}
          className="bg-gray-500 text-white px-4 py-2"
        >
          Reset
        </button>
      </div>

      <div className="mb-4">
        <p>Transcript: {transcript}</p>
      </div>

      <form onSubmit={submit}>
        <input
          placeholder="Title"
          className="border p-2 mr-2"
          value={expense.title}
          onChange={(e) => setExpense({ ...expense, title: e.target.value })}
        />

        <input
          placeholder="Amount"
          type="number"
          className="border p-2 mr-2"
          value={expense.amount}
          onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
        />

        <select
          className="border p-2 mr-2"
          value={expense.category}
          onChange={(e) => setExpense({ ...expense, category: e.target.value })}
        >
          <option>Food</option>
          <option>Travel</option>
          <option>Shopping</option>
          <option>Bills</option>
          <option>Others</option>
        </select>

        <input
          type="date"
          className="border p-2 mr-2"
          value={expense.date}
          onChange={(e) => setExpense({ ...expense, date: e.target.value })}
        />

        <button className="bg-blue-500 text-white px-4 py-2">Add Expense</button>
      </form>
    </div>
  );
}

export default ExpenseForm;
