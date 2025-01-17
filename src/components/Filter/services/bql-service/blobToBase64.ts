const blobToBase64 = (blob: Blob): Promise<string> => {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		// @ts-ignore
		reader.onload = () => resolve(reader.result.toString());
		reader.onerror = (error) => reject(error);
	});
};

export default blobToBase64;
