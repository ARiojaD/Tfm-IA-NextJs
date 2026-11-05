import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transformers.js runs the embedding model with native ONNX binaries: Node loads them from node_modules
  // at run time instead of the bundler trying to pack them.
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node"],
};

export default nextConfig;
