const blobToBase64 = (blob: Blob): Promise<string> => {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onload = () => resolve(reader.result ? reader.result.toString() : '');
		reader.onerror = (error) => reject(error);
	});
};

export default blobToBase64;
