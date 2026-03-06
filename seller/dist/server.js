import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Payments } from '@nevermined-io/payments';
import { paymentMiddleware } from '@nevermined-io/payments/express';
import { ConvexHttpClient } from 'convex/browser';
const NVM_API_KEY = process.env.NVM_API_KEY;
const NVM_PLAN_ID = process.env.NVM_PLAN_ID;
const NVM_AGENT_ID = process.env.NVM_AGENT_ID;
const NVM_ENVIRONMENT = (process.env.NVM_ENVIRONMENT ?? 'sandbox');
const CONVEX_URL = process.env.CONVEX_URL;
const PORT = parseInt(process.env.PORT ?? '3001');
if (!NVM_API_KEY || !NVM_PLAN_ID || !NVM_AGENT_ID || !CONVEX_URL) {
    console.error('Missing required env vars: NVM_API_KEY, NVM_PLAN_ID, NVM_AGENT_ID, CONVEX_URL');
    process.exit(1);
}
const payments = Payments.getInstance({ nvmApiKey: NVM_API_KEY, environment: NVM_ENVIRONMENT });
const convex = new ConvexHttpClient(CONVEX_URL);
const PRICING = {
    planId: NVM_PLAN_ID,
    agentId: NVM_AGENT_ID,
    tiers: {
        search: {
            credits: 1,
            description: 'Search the AgentIn directory — returns agents matching your query',
        },
    },
};
const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.get('/pricing', (_req, res) => {
    res.json(PRICING);
});
app.use(paymentMiddleware(payments, {
    'POST /data': {
        planId: NVM_PLAN_ID,
        credits: 1,
        ...(NVM_AGENT_ID && { agentId: NVM_AGENT_ID }),
    },
}));
app.post('/data', async (req, res) => {
    try {
        const { query = '' } = req.body;
        const agents = await convex.query('agents:list');
        const q = query.toLowerCase().trim();
        const results = q
            ? agents.filter((a) => {
                const haystack = [a.name, a.team_name, a.tagline, ...(a.skills ?? [])].join(' ').toLowerCase();
                return haystack.includes(q);
            })
            : agents;
        res.json({
            query,
            total: results.length,
            agents: results.map((a) => ({
                id: a._id,
                name: a.name,
                team: a.team_name,
                tagline: a.tagline,
                skills: a.skills,
                endpoint: a.endpoint ?? null,
            })),
        });
    }
    catch (err) {
        console.error('Error querying agents:', err);
        res.status(500).json({ error: 'Failed to query agent directory' });
    }
});
app.listen(PORT, () => {
    console.log(`AgentIn seller running on port ${PORT}`);
    console.log(`Plan ID: ${NVM_PLAN_ID}`);
});
