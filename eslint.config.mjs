export default [
  {
    ignores: ["node_modules/**", ".next/**", "public/**"],
  },
  {
    files: ["src/app/**/*.{js,jsx}", "src/lib/**/*.{js,jsx}", "src/server/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-router-dom",
              message: "Use Next.js App Router APIs instead of react-router-dom in new code.",
            },
            {
              name: "flowbite-react",
              message: "Use local shadcn/Radix UI components instead of Flowbite in new code.",
            },
            {
              name: "preline",
              message: "Do not add new Preline usage.",
            },
            {
              name: "formik",
              message: "Use react-hook-form in new code.",
            },
            {
              name: "yup",
              message: "Use zod in new code.",
            },
            {
              name: "react-icons",
              message: "Use lucide-react in new code.",
            },
            {
              name: "@mui/icons-material",
              message: "Use lucide-react unless an existing MUI screen still requires MUI icons.",
            },
            {
              name: "@fortawesome/fontawesome-free",
              message: "Do not add new Font Awesome usage.",
            },
            {
              name: "axios",
              message: "Use the shared fetch client in src/lib/http/api-client.js for new code.",
            }
          ]
        }
      ]
    }
  },
  {
    files: ["src/server/**/*.{js,jsx}", "src/app/api/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "axios",
              message: "Use native fetch on the server."
            },
            {
              name: "react-router-dom",
              message: "Server code must not depend on client routing libraries."
            }
          ]
        }
      ]
    }
  }
];
