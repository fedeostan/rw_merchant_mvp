module.exports = {
  api: {
    input: {
      target: "./openapi/schema.yaml",
    },
    output: {
      mode: "tags-split",
      target: "./src/lib/api/generated.ts",
      schemas: "./src/lib/api/generated/schemas",
      client: "react-query",
      mock: false,
      override: {
        mutator: {
          path: "./src/lib/api/fetcher.ts",
          name: "customInstance",
        },
        operations: {
          "post-auth-otp-send": {
            mutator: "./src/lib/api/fetcher.ts#customInstance",
          },
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
    hooks: {
      afterAllFilesWrite: "prettier --write",
    },
  },
};

