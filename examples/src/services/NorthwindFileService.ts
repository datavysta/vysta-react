import { VystaClient, VystaFileService } from '@datavysta/vysta-client';

export class NorthwindFileService extends VystaFileService {
    constructor(client: VystaClient) {
        super(client, 'NorthwindFile', true /* debug */);
    }
} 