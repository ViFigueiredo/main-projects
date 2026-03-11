import { NextRequest, NextResponse } from "next/server";
import { openApiSpec, specToYaml } from "@/lib/openapi-spec";

// GET /api/docs/openapi - Retorna especificação OpenAPI
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";

  // Atualiza a URL base com a URL atual
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const spec = {
    ...openApiSpec,
    servers: [
      {
        url: `${baseUrl}/api/v1`,
        description: "API Server",
      },
    ],
  };

  if (format === "yaml") {
    const yaml = specToYaml(spec);
    return new NextResponse(yaml, {
      headers: {
        "Content-Type": "text/yaml",
        "Content-Disposition": "attachment; filename=openapi.yaml",
      },
    });
  }

  // JSON (default)
  return NextResponse.json(spec, {
    headers: {
      "Content-Disposition": format === "download" ? "attachment; filename=openapi.json" : "inline",
    },
  });
}
