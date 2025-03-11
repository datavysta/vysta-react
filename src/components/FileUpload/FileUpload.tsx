import React, { useEffect } from 'react';
import { VystaFileService } from '@datavysta/vysta-client';
import { DragDrop, StatusBar } from '@uppy/react';
import Uppy from '@uppy/core';
import Tus from '@uppy/tus';
import '@uppy/core/dist/style.min.css';
import '@uppy/drag-drop/dist/style.min.css';
import '@uppy/status-bar/dist/style.min.css';
import '@uppy/progress-bar/dist/style.css';
import '@uppy/file-input/dist/style.css';

interface FileUploadProps {
    fileService: VystaFileService;
    onUploadSuccess?: (fileId: string, fileName: string) => void;
    filename?: string;
}

type Meta = Record<string, never>;
type Body = Record<string, never>;

export function FileUpload({ fileService, onUploadSuccess, filename }: FileUploadProps) {
    const [uppy, setUppy] = React.useState<Uppy<Meta, Body> | null>(null);

    useEffect(() => {
        const uppyInstance = new Uppy<Meta, Body>().use(Tus, {});
        setUppy(uppyInstance);

        const setupUppy = async () => {
            const tusOptions = await fileService.getTusXhrOptions();
            const tusPlugin = uppyInstance.getPlugin('Tus');
            if (tusPlugin) {
                tusPlugin.setOptions(tusOptions);
            }
        };

        setupUppy();

        uppyInstance.on('upload-success', (file, response) => {
            if (!file?.name || !response.uploadURL) return;

            const fileId = response.uploadURL.split('/').pop();
            if (!fileId) return;

            console.log('Extracted file ID:', fileId);
            
            const finalFileName = filename || file.name;
            
            fileService.registerUploadedFile({
                path: '/',
                id: fileId,
                name: finalFileName
            }).catch(console.error);
            
            onUploadSuccess?.(fileId, finalFileName);
        });

        return () => {
            uppyInstance.cancelAll();
        };
    }, [fileService, onUploadSuccess, filename]);

    if (!uppy) return null;

    return (
        <div>
            <DragDrop uppy={uppy} />
            <StatusBar uppy={uppy} hideUploadButton={false} />
        </div>
    );
} 