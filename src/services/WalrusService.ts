export interface WalrusUploadResult {
    blobId: string;
    suiRefType?: string;
    media_type?: string;
}

// Walrus Testnet Public Endpoints (Hackathon Defaults)
// Documentation: https://docs.walrus.site/
const PUBLISHER_URLS = [
    'https://publisher.walrus-testnet.walrus.space',
    'https://wal-publisher-testnet.staketab.org',
    'https://walrus-testnet-publisher.nodeinfra.com',
    'https://walrus-testnet-publisher.nodes.guru'
];

export class WalrusService {
    /**
     * Uploads a file (blob) to Walrus Grid
     * @param uri The local file URI of the image
     * @param metadata Optional metadata to store
     * @returns The blobId (and other info) from Walrus
     */
    static async uploadImage(uri: string, metadata?: any): Promise<WalrusUploadResult> {
        console.log('Walrus Upload Starting for:', uri);

        // 1. Prepare the file blob from URI
        const response = await fetch(uri);
        const blob = await response.blob();
        console.log(`Blob created, size: ${blob.size} bytes`);
        console.log(blob);

        // 2. Try Upload to Walrus Publishers (Fallback logic)
        let lastError;

        for (const publisherUrl of PUBLISHER_URLS) {
            try {
                console.log(`Attempting upload to: ${publisherUrl}`);

                // 30 Second Timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000);

                // Walrus Publisher accepts raw binary body via PUT
                // CORRECT ENDPOINT: /v1/blobs (not /v1/store)
                const uploadResponse = await fetch(`${publisherUrl}/v1/blobs?epochs=5`, {
                    method: 'PUT',
                    body: blob,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!uploadResponse.ok) {
                    const errText = await uploadResponse.text();
                    throw new Error(`Status: ${uploadResponse.status} - ${errText}`);
                }

                // 3. Parse Result
                const result = await uploadResponse.json();
                console.log('Walrus Upload Success:', result);

                let blobId = '';

                if (result.newlyCreated) {
                    blobId = result.newlyCreated.blobObject.blobId;
                } else if (result.alreadyCertified) {
                    blobId = result.alreadyCertified.blobId;
                } else {
                    throw new Error('Unknown Walrus response structure');
                }

                return {
                    blobId: blobId,
                    media_type: 'image/jpeg'
                };
            } catch (error) {
                console.warn(`Failed upload to ${publisherUrl}:`, error);
                lastError = error;
                // Try next publisher
            }
        }

        // If we get here, all publishers failed
        console.error('All Walrus publishers failed.');
        throw lastError || new Error('All Walrus publishers failed');
    }

    /**
     * Returns the HTTP URL for a given blob ID using a public aggregator
     * @param blobId The Walrus Blob ID
     */
    static getBlobUrl(blobId: string): string {
        // Use a reliable aggregator
        return `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`;
    }
}
