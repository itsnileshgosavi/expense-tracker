import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node", // Use "jsdom" for component tests
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1", // Maps `@/` to root directory
  },
  testMatch: ["**/*.test.ts", "**/*.test.tsx"], // Matches `.test.ts` and `.test.tsx` files
};

export default config;


  