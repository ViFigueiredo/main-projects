"use client";

import { useEffect, useRef, useState } from "react";
import { FileJson, FileText, Copy, Check, ExternalLink } from "lucide-react";

export default function DocsPage() {
  const swaggerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBaseUrl(window.location.origin);
    
    // Carrega Swagger UI dinamicamente
    const loadSwagger = async () => {
      // Adiciona CSS do Swagger UI
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css";
      document.head.appendChild(link);

      // Adiciona script do Swagger UI
      const script = document.createElement("script");
      script.src = "https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js";
      script.onload = () => {
        // @ts-expect-error - SwaggerUIBundle é carregado globalmente
        window.SwaggerUIBundle({
          url: "/api/docs/openapi",
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [
            // @ts-expect-error - SwaggerUIBundle é carregado globalmente
            window.SwaggerUIBundle.presets.apis,
          ],
          layout: "BaseLayout",
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 1,
          docExpansion: "list",
          filter: true,
          showExtensions: true,
          showCommonExtensions: true,
          tryItOutEnabled: true,
        });
      };
      document.body.appendChild(script);
    };

    loadSwagger();
  }, []);

  const copyApiUrl = () => {
    navigator.clipboard.writeText(`${baseUrl}/api/docs/openapi`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/WhatsUpLeads_logo.png" alt="WhatsUpLeads" className="h-8 w-8 rounded-lg" />
              <div>
                <h1 className="text-lg font-semibold">
                  <span className="text-slate-900">WhatsUp</span>
                  <span style={{ color: "#5dbeb4" }}>Leads</span>
                  <span className="text-slate-900"> API</span>
                </h1>
                <p className="text-xs text-slate-500">Documentação v1.0.0</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* URL da spec */}
              <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5">
                <code className="text-xs text-slate-600">{baseUrl}/api/docs/openapi</code>
                <button onClick={copyApiUrl} className="p-1 hover:bg-slate-200 rounded">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
                </button>
              </div>

              {/* Botões de download */}
              <a
                href="/api/docs/openapi?format=download"
                download="openapi.json"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FileJson className="h-4 w-4" />
                <span className="hidden sm:inline">JSON</span>
              </a>
              <a
                href="/api/docs/openapi?format=yaml"
                download="openapi.yaml"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">YAML</span>
              </a>
              <a
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:opacity-90"
                style={{ background: "#5dbeb4" }}
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Start */}
      <div className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold mb-4">🚀 Quick Start</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">1. Obtenha sua API Key</h3>
              <p className="text-sm text-slate-300">
                Acesse <code className="bg-slate-800 px-1 rounded">Dashboard → Configurações</code> e copie sua API Key.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">2. Faça sua primeira requisição</h3>
              <pre className="bg-slate-800 rounded-lg p-3 text-xs overflow-x-auto">
{`curl -X POST ${baseUrl}/api/v1/messages/send \\
  -H "x-api-key: SUA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "instanceId": "ID_DA_INSTANCIA",
    "to": "5511999999999",
    "type": "text",
    "content": { "body": "Olá!" }
  }'`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Swagger UI */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div id="swagger-ui" ref={swaggerRef} className="swagger-container" />
      </div>

      {/* Custom styles for Swagger UI */}
      <style jsx global>{`
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info { margin: 20px 0; }
        .swagger-ui .info .title { font-size: 1.5rem; }
        .swagger-ui .scheme-container { background: #f8fafc; padding: 15px; border-radius: 8px; }
        .swagger-ui .opblock-tag { font-size: 1rem; border-bottom: 1px solid #e2e8f0; }
        .swagger-ui .opblock { border-radius: 8px; margin-bottom: 10px; }
        .swagger-ui .opblock .opblock-summary { border-radius: 8px; }
        .swagger-ui .opblock.opblock-post { border-color: #5dbeb4; background: rgba(93, 190, 180, 0.05); }
        .swagger-ui .opblock.opblock-post .opblock-summary { border-color: #5dbeb4; }
        .swagger-ui .opblock.opblock-get { border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
        .swagger-ui .opblock.opblock-get .opblock-summary { border-color: #3b82f6; }
        .swagger-ui .opblock.opblock-delete { border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }
        .swagger-ui .opblock.opblock-delete .opblock-summary { border-color: #ef4444; }
        .swagger-ui .btn.execute { background: #5dbeb4; border-color: #5dbeb4; }
        .swagger-ui .btn.execute:hover { background: #4aa89f; }
        .swagger-ui .model-box { background: #f8fafc; }
        .swagger-ui section.models { border: 1px solid #e2e8f0; border-radius: 8px; }
        .swagger-ui section.models h4 { border-bottom: 1px solid #e2e8f0; }
      `}</style>
    </div>
  );
}
