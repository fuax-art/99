import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/products')
      .then(response => response.json())
      .then(data => setProducts(data));
  }, []);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    const userMessage = { text: prompt, sender: 'user' };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const response = await fetch('http://localhost:3001/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    const botMessage = { text: data.text, sender: 'bot' };
    setMessages([...newMessages, botMessage]);
    setPrompt('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Virtual Shop</h1>
      </header>
      <main>
        <h2>Products</h2>
        <div className="product-list">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p>${product.price}</p>
              <p>{product.description}</p>
            </div>
          ))}
        </div>
        <div className="chat-container">
          <h2>Chat with our AI assistant</h2>
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                {message.text}
              </div>
            ))}
          </div>
          <form onSubmit={handleChatSubmit}>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask a question..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;

