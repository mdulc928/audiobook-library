# Style and Guidelines

- Never use inline SVG for an icon. Create a icon file first and import it in the place you want to use it.
- Never use the type "any", instead do your best to get the type and if you can't, use `unknown`.
- Keep code modular, but localized.
- Typically use the icons in the design system,and if you need to use another icon, create the file in the icons folder and import it. Prompt the user to put the icon svg in the file you created, so that you can see it.
- Use tailwindcss for styling.
  - It is bad practice to use 'sm:class' for smaller screens. You should always start with the smaller screens in mind when styling and then use 'md:class' and 'lg:class' for larger screens.
- Use the resolve function from $app/paths to generate the path for the API.

# AI-SDK

You should be to start finding what you need here: https://ai-sdk.dev/docs/reference/ai-sdk-core

# Bits-UI:

To find bits-ui documentation, you can visit this link here: https://bits-ui.com/llms.txt and pick out what you need from there.

# Svelte and SvelteKit

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
