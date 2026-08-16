import { useState } from "react"
import "prismjs/themes/prism-tomorrow.css"

import EditorDefault from "react-simple-code-editor"

import prism from "prismjs"

import MarkdownDefault from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"

import axios from "axios"
import "./App.css"

const Editor = EditorDefault.default || EditorDefault
const Markdown = MarkdownDefault.default || MarkdownDefault
 
const extractText = (node) => {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node != null && node.props && node.props.children) return extractText(node.props.children);
  return "";
};

const CodeBlock = ({ inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || "");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const rawCode = extractText(children); // Yahan humne fix lagaya hai!
    navigator.clipboard.writeText(rawCode.replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div style={{ position: "relative", marginTop: "1rem", marginBottom: "1rem", borderRadius: "6px", overflow: "hidden", border: "1px solid #444" }}>
        {/* Header jisme Language Name aur Copy Button hai */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#2d2d2d", padding: "6px 12px", fontSize: "12px", color: "#aaa" }}>
          <span>{match[1].toUpperCase()}</span>
          <button 
            onClick={handleCopy} 
            style={{ background: "transparent", border: "none", color: copied ? "#4ade80" : "#fff", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
          >
            {copied ? "✓ Copied!" : "📋 Copy Code"}
          </button>
        </div>
        {/* Asli Code */}
        <code className={className} {...props} style={{ display: "block", padding: "12px", backgroundColor: "#1e1e1e", overflowX: "auto", fontSize: "14px", whiteSpace: "pre" }}>
          {children}
        </code>
      </div>
    );
  }
  return <code className={className} {...props}>{children}</code>;
};
function App() {
  const [code, setCode] = useState(`function sum() {
  return 1 + 1
}`)

  const [review, setReview] = useState("")
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState("javascript") 

  async function reviewCode() {
    if (!code.trim()) {
      setReview("Please enter some code before requesting a review.")
      return
    }

    try {
      setLoading(true)

      const response = await axios.post(
        "https://ai-code-reviewer-backend-9pqk.onrender.com/ai/get-review",
        { code,language }
      )

      setReview(response.data)
    } catch (error) {
      console.error("Backend error:", error)
      setReview(
        "## Unable to generate review\n\nPlease make sure the backend server is running."
      )
    } finally {
      setLoading(false)
    }
  }

  function clearCode() {
    setCode("")
    setReview("")
  }

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div className="brand">
          <div className="brand-icon">⌘</div>

          <div>
            <h1>AI Code Reviewer</h1>
            <p>Write better code with intelligent feedback</p>
          </div>
        </div>

        <div className="header-status">
          <span className="status-dot"></span>
          AI Review Engine
        </div>
      </header>


      {/* Main Workspace */}
      <main className="workspace">

        {/* Left Panel */}
        <section className="panel editor-panel">

          <div className="panel-header">
            <div>
              <span className="panel-title">Your Code</span>
              <span className="panel-subtitle">Write or paste your code</span>
            </div>

            <div className="language">
  <select 
    value={language} 
    onChange={(e) => setLanguage(e.target.value)}
    style={{ 
      backgroundColor: '#2d2d2d', /* Transparent ki jagah dark color */
      color: 'white', 
      border: '1px solid #555', 
      borderRadius: '4px', 
      padding: '4px 8px',
      outline: 'none'
    }}
  >
    <option value="javascript">JavaScript</option>
    <option value="python">Python</option>
    <option value="cpp">C++</option>
    <option value="java">Java</option>
  </select>
</div>
          </div>

          <div className="editor-container">
            <Editor
              value={code}
              onValueChange={code => setCode(code)}
              highlight={code =>
  prism.highlight(
    code,
    prism.languages[language] || prism.languages.javascript,
    language
  )
}
              padding={20}
              style={{
                fontFamily: '"Fira Code", "Fira Mono", monospace',
                fontSize: 15,
                minHeight: "100%",
                width: "100%",
              }}
            />
          </div>

          <div className="editor-footer">
            <span>{code.length} characters</span>

            <div className="actions">
              <button
                className="clear-btn"
                onClick={clearCode}
              >
                Clear
              </button>

              <button
                className="review-btn"
                onClick={reviewCode}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Reviewing...
                  </>
                ) : (
                  <>
                    ✦ Review Code
                  </>
                )}
              </button>
            </div>
          </div>

        </section>


        {/* Right Panel */}
        <section className="panel review-panel">

          <div className="panel-header">
            <div>
              <span className="panel-title">AI Review</span>
              <span className="panel-subtitle">
                Analysis and recommendations
              </span>
            </div>

            {review && !loading && (
              <div className="review-status">
                ✓ Complete
              </div>
            )}
          </div>

          <div className="review-content">

            {!review && !loading && (
              <div className="empty-state">

                <div className="empty-icon">
                  ✦
                </div>

                <h2>Ready to review your code</h2>

                <p>
                  Submit your code and our AI reviewer will analyze
                  it for bugs, performance, security and code quality.
                </p>

                <div className="features">
                  <span>✓ Bug Detection</span>
                  <span>✓ Performance</span>
                  <span>✓ Best Practices</span>
                  <span>✓ Security</span>
                </div>

              </div>
            )}

            {loading && (
              <div className="loading-state">
                <div className="large-spinner"></div>

                <h2>Analyzing your code...</h2>

                <p>
                  AI is checking your code for issues and possible
                  improvements.
                </p>
              </div>
            )}

            {review && !loading && (
              <div className="markdown-container">
                <Markdown
  rehypePlugins={[rehypeHighlight]}
  components={{
    code: CodeBlock
  }}
>
  {review}
</Markdown>
              </div>
            )}

          </div>

        </section>

      </main>

      <footer className="footer">
        Powered by AI • Built for developers
      </footer>

    </div>
  )
}

export default App