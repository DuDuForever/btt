
'use server';
/**
 * @fileOverview A Genkit flow for generating insights about a salon client.
 *
 * - getClientInsight: Generates a summary of a client's visit history.
 * - GetClientInsightInput: The input type for the getClientInsight function.
 * - GetClientInsightOutput: The return type for the getClientInsight function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const VisitSchema = z.object({
  id: z.string(),
  date: z.string().describe("The ISO 8601 date string of the visit."),
  services: z.array(z.string()),
  amount: z.number(),
  paid: z.boolean(),
  notes: z.string().optional().nullable(),
  nextVisit: z.string().optional().nullable().describe("The ISO 8601 date string for the next visit, if scheduled."),
});

const ClientSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  photoUrl: z.string(),
  visits: z.array(VisitSchema),
});

const GetClientInsightInputSchema = z.object({
  client: ClientSchema,
});
export type GetClientInsightInput = z.infer<typeof GetClientInsightInputSchema>;

const GetClientInsightOutputSchema = z.object({
  summary: z.string().describe("A concise summary of the client's behavior, habits, and value to the business."),
});
export type GetClientInsightOutput = z.infer<typeof GetClientInsightOutputSchema>;

export async function getClientInsight(input: GetClientInsightInput): Promise<GetClientInsightOutput> {
  return clientInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'clientInsightPrompt',
  input: { schema: GetClientInsightInputSchema },
  output: { schema: GetClientInsightOutputSchema },
  prompt: `
    You are an expert business analyst for a salon. Your task is to analyze a client's visit history and provide a short, insightful summary.

    Analyze the provided client data, which includes their name and a list of all their past visits. Each visit has a date, a list of services, the amount paid, and payment status.

    Based on this data, generate a concise summary (2-3 sentences) covering the following points:
    - Loyalty and value: Is this a regular/loyal client? Mention total spending and number of visits.
    - Service preferences: What are their most frequent services?
    - Visit frequency: How often do they visit? Calculate the approximate time between their most common services if possible.
    - Any other notable patterns (e.g., always pays on time, frequently books follow-up appointments, etc.).

    Here is the client data in JSON format:
    \`\`\`json
    {{{json client}}}
    \`\`\`

    Provide only the summary as your output.
  `,
});

const clientInsightFlow = ai.defineFlow(
  {
    name: 'clientInsightFlow',
    inputSchema: GetClientInsightInputSchema,
    outputSchema: GetClientInsightOutputSchema,
  },
  async (input) => {
    // Convert date objects to ISO strings for consistent JSON serialization
    const serializableClient = {
        ...input.client,
        visits: input.client.visits.map(v => ({
            ...v,
            date: new Date(v.date).toISOString(),
            nextVisit: v.nextVisit ? new Date(v.nextVisit).toISOString() : null,
        }))
    };
    
    const { output } = await prompt({ client: serializableClient });
    return output!;
  }
);
