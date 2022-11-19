let files = [];
let seekIndex;

self.onmessage = async (evt) => {
	seekIndex = evt.data?.index;
	if (evt.data.cmd == "init") {
		files = evt.data.images;
	}
	if (evt.data.cmd == "seek") {
		const res = await createImageBitmap(files[evt.data.i]);
		files[evt.data.i] = null;
		self.postMessage(
			{
				i: evt.data.i,
				res,
			},
			[res]
		);
		res.close();
	}
};
