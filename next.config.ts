import type { NextConfig } from "next";
import { SECURITY_HEADERS } from "./src/lib/securityHeaders";

// El motor de ONNX para Linux x64, que es lo que ejecuta Vercel. Los binarios de otros sistemas y los de GPU
// (CUDA) no se usan y harían pasar a las funciones del límite de tamaño. onnxruntime-node carga la versión
// CommonJS de onnxruntime-common, y el rastreo solo ve la ESM (la que importa Transformers.js).
const ONNX_RUNTIME_FILES = [
  "./node_modules/onnxruntime-common/**/*",
  "./node_modules/onnxruntime-node/package.json",
  "./node_modules/onnxruntime-node/dist/**/*",
  "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/onnxruntime_binding.node",
  "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/libonnxruntime.so.1",
];

const nextConfig: NextConfig = {
  // Sin «X-Powered-By: Next.js»: no hace falta anunciar con qué está hecha la web.
  poweredByHeader: false,
  // Las cabeceras de seguridad fijas en todas las respuestas; la CSP, con su nonce, la pone src/proxy.ts.
  headers: () => Promise.resolve([{ source: "/:path*", headers: SECURITY_HEADERS }]),
  // Transformers.js ejecuta el modelo de embeddings con binarios nativos de ONNX: Node los carga de
  // node_modules al ejecutarse, en lugar de que el empaquetador intente meterlos en el bundle.
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node"],
  // Lo que el rastreo de Next no ve y las funciones de Vercel necesitan:
  // - onnxruntime-node: Transformers.js lo carga con un require construido en tiempo de ejecución.
  // - El modelo de embeddings, que deja `npm run model:download`: en Vercel el disco es de solo lectura y no
  //   se puede descargar al arrancar.
  // Va en todas las rutas: comparten el container, y con Turbopack los includes no se limitan por ruta.
  outputFileTracingIncludes: {
    "/**": [...ONNX_RUNTIME_FILES, "./.cache/transformers/**/*"],
  },
};

export default nextConfig;
