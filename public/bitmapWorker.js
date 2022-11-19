let files = [];
let seekIndex;

self.onmessage = async (evt) => {
	seekIndex = evt.data?.index;
	if (evt.data.cmd == "init") {
		files = evt.data.images;
		self.postMessage("Success");
	}
	if (evt.data.cmd == "seek") {
		const res = await createImageBitmap(files[evt.data.index]);
		files[evt.data.index] = null;
		self.postMessage(res, [res]);
		res.close();
	}
};
