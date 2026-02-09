// Read environment variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

// Validate required environment variables
if (!projectId) {
    throw new Error(
        'Missing required environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID. ' +
        'Please add it to your .env.local file.'
    );
}

if (!dataset) {
    throw new Error(
        'Missing required environment variable: NEXT_PUBLIC_SANITY_DATASET. ' +
        'Please add it to your .env.local file.'
    );
}

// Export validated configuration
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-02-09';
export { dataset, projectId };
export const useCdn = false;
