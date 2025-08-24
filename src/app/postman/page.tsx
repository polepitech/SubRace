// app/dev/request-tester/page.tsx
"use client";

import React from "react";

type Method = "POST" | "GET" | "PUT" | "PATCH" | "DELETE";

export default function RequestTester() {
  const [url, setUrl] = React.useState("/api/postVideo");
  const [method, setMethod] = React.useState<Method>("POST");
  const [body, setBody] = React.useState(
    JSON.stringify(
      {
        day: 3,
        followers_number: 30000,
        winner: "Alice",
        second: "Bob",
        third: "Charlie",
      },
      null,
      2
    )
  );
  const [headers, setHeaders] = React.useState(`{ "Content-Type": "application/json" }`);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<string>("");
  const [elapsed, setElapsed] = React.useState<number | null>(null);
  const [responseText, setResponseText] = React.useState<string>("");

  // Persistance simple
  React.useEffect(() => {
    const saved = localStorage.getItem("reqTester");
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        if (obj.url) setUrl(obj.url);
        if (obj.method) setMethod(obj.method);
        if (obj.body) setBody(obj.body);
        if (obj.headers) setHeaders(obj.headers);
      } catch {}
    }
  }, []);
  React.useEffect(() => {
    localStorage.setItem(
      "reqTester",
      JSON.stringify({ url, method, body, headers })
    );
  }, [url, method, body, headers]);

  async function send() {
    setLoading(true);
    setStatus("");
    setElapsed(null);
    setResponseText("");

    let hdrs: Record<string, string> = {};
    try {
      hdrs = headers.trim() ? JSON.parse(headers) : {};
    } catch (e) {
      setLoading(false);
      setStatus("Invalid headers JSON");
      return;
    }

    const fetchInit: RequestInit = { method, headers: hdrs };
    if (method !== "GET" && method !== "DELETE") {
      fetchInit.body = body;
    }

    const t0 = performance.now();
    try {
      const res = await fetch(url, fetchInit);
      const t1 = performance.now();
      setElapsed(Math.round(t1 - t0));
      setStatus(`${res.status} ${res.statusText}`);

      const text = await res.text();
      // essaie de pretty-print si JSON
      try {
        const j = JSON.parse(text);
        setResponseText(JSON.stringify(j, null, 2));
      } catch {
        setResponseText(text);
      }
    } catch (err: unknown) {
        const t1 = performance.now();
        setElapsed(Math.round(t1 - t0));
        setStatus("Request failed");

        if (err instanceof Error) {
            setResponseText(err.message);
        } else {
            setResponseText(String(err));
        }
    } finally {
      setLoading(false);
    }
  }

  function prettifyBody() {
    try {
      const j = JSON.parse(body);
      setBody(JSON.stringify(j, null, 2));
    } catch {}
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Request Tester</h1>

      <div className="flex gap-2">
        <select
          className="border rounded px-2 py-1"
          value={method}
          onChange={(e) => setMethod(e.target.value as Method)}
        >
          {["POST","GET","PUT","PATCH","DELETE"].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          className="flex-1 border rounded px-3 py-1"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/api/postVideo"
        />
        <button
          className="border rounded px-3 py-1"
          onClick={send}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Headers (JSON)</label>
          <textarea
            className="w-full h-24 border rounded p-2 font-mono text-sm"
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
          />
        </div>
        {method !== "GET" && method !== "DELETE" && (
          <div>
            <div className="flex items-center justify-between">
              <label className="block mb-1 text-sm font-medium">Body (JSON)</label>
              <button className="text-sm underline" onClick={prettifyBody}>
                Prettify
              </button>
            </div>
            <textarea
              className="w-full h-40 border rounded p-2 font-mono text-sm"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="border rounded p-3">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Status:</span> {status}{" "}
          {elapsed !== null && <span>• {elapsed} ms</span>}
        </div>
        <pre className="mt-2 whitespace-pre-wrap break-all font-mono text-sm">
{responseText || "(no response)"}
        </pre>
      </div>
    </div>
  );
}
