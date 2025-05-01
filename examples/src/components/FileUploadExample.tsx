import React from 'react';
import { FileUpload } from '../../../src/components/FileUpload/FileUpload';
import { useServices } from './ServicesProvider';
import './FileUploadExample.css';

interface FileUploadExampleProps {
    tick: number;
}

export function FileUploadExample({ tick }: FileUploadExampleProps) {
    const { fileService } = useServices();

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
                        filename={"jp.xlsx"}
                        allowedFileTypes={["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "text/csv"]}
                        autoProceed={true}
                    />
                </div>
            </div>
        </div>
    );
} 