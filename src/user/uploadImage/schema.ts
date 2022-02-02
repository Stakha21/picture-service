export default {
  type: "object",
  properties: {
    image: { type: "string" },
  },
  required: ["email"],
} as const;
