import React, { useEffect } from 'react';
import { VystaClient, VystaFileService } from '@datavysta/vysta-client';
import { DragDrop, StatusBar } from '@uppy/react';
import Uppy from '@uppy/core';
import Tus from '@uppy/tus';
import '@uppy/core/dist/style.min.css';
import '@uppy/drag-drop/dist/style.min.css';
import '@uppy/status-bar/dist/style.min.css';
import '@uppy/progress-bar/dist/style.css';
import '@uppy/file-input/dist/style.css';

interface FileUploadProps {
    client: VystaClient;
    fileService: VystaFileService;
    onUploadSuccess?: (fileId: string, fileName: string) => void;
}

type Meta = Record<string, never>;
type Body = Record<string, never>;

export function FileUpload({ client, fileService, onUploadSuccess }: FileUploadProps) {
    const uppy = React.useMemo(() => {
        return new Uppy<Meta, Body>()
            .use(Tus, {});
    }, []);

    useEffect(() => {
        const setupUppy = async () => {
            const tusOptions = await fileService.getTusXhrOptions();
            const tusPlugin = uppy.getPlugin('Tus');
            if (tusPlugin) {
                tusPlugin.setOptions(tusOptions);
            }
        };

        setupUppy();

        uppy.on('upload-success', (file, _) => {
            if (!file?.name || !file?.id) return;

            console.log("Uppy file response", file.id);
            
            fileService.registerUploadedFile({
                path: '/',
                id: file.id,
                name: file.name
            }).catch(console.error);
            
            onUploadSuccess?.(file.id, file.name);
        });

        return () => {
            uppy.cancelAll();
        };
    }, [client, fileService, onUploadSuccess, uppy]);

    return (
        <div>
            <DragDrop uppy={uppy} />
            <StatusBar uppy={uppy} hideUploadButton={false} />
        </div>
    );
} 