// Zod schemas shared between frontend and backend

import { z } from "zod";

export const exampleSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});