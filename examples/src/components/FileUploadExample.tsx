import React, { useMemo } from 'react';
import { VystaClient } from '@datavysta/vysta-client';
import { FileUpload } from '../../../src/components/FileUpload/FileUpload';
import { NorthwindFileService } from '../services/NorthwindFileService';
import './FileUploadExample.css';

interface FileUploadExampleProps {
    client: VystaClient;
    tick: number;
}

export function FileUploadExample({ 
    client,
    tick 
}: FileUploadExampleProps) {
    const fileService = useMemo(() => new NorthwindFileService(client), [client]);

    return (
        <div className="example-container">
            <div className="upload-content">
                <h1>File Upload Example</h1>
                <div className="upload-container">
                    <FileUpload
                        fileService={fileService}
                        onUploadSuccess={(fileId, fileName) => {
                            console.log(`File uploaded: ${fileName} with ID: ${fileId}`);
                        }}
                    />
                </div>
            </div>
        </div>
    );
} 