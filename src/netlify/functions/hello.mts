
// import type { Context } from "@netlify/functions";

// export default async (req: Request, context: Context) => {
//   return new Response("Hello, world!")
// }

// import type { Context } from "@netlify/functions";
// export default async (req: Request, context: Context) => {
//   return new Response("Hello, world!")
// }
import type { Handler } from "@netlify/functions";

const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain"
    },
    body: "Hello, world!"
  };
};

export { handler };