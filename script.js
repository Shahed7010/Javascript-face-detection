const imageUpload = document.getElementById('imageUpload');

const loading = document.createElement('div');
loading.textContent = 'Loading...';
document.body.append(loading);


Promise.all([
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
]).then(start);

async function start() {
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '100%';
    document.body.append(container);

    const labeledFaceDescriptors = await loadLabeledImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

    loading.textContent = 'Select image now.';


    let image;
    let canvas;
    imageUpload.addEventListener('change', async () => {
        if (image) image.remove();
        if (canvas) canvas.remove();
        image = await faceapi.bufferToImage(imageUpload.files[0]);
        image.style.height = '500px';
        container.append(image);

        canvas = faceapi.createCanvasFromMedia(image);
        container.append(canvas);

        const displaySize = { width: image.width, height: image.height };
        faceapi.matchDimensions(canvas, displaySize);

        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

        const resizeDetections = faceapi.resizeResults(detections, displaySize);
        const results = resizeDetections.map(d => faceMatcher.findBestMatch(d.descriptor));

        results.forEach((detection, index) => {
            const box = resizeDetections[index].detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, { label: detection.toString() });
            drawBox.draw(canvas);
        });

        document.body.append(detections.length + ' recognized.');
        loading.remove();
    });
}

function loadLabeledImages() {
    const labels = ['Shahed', 'Shahin', 'Rakib', 'Shakil', 'Miraj', 'Sani', 'Mahfuz'];

    return Promise.all(
        labels.map(async (label) => {
            const descriptions = [];
            for (let index = 1; index <= 1; index++) {
                const image = await faceapi.fetchImage(`http://127.0.0.1:5500/labeled-images/${label}/${index}.jpg`);
                const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();
                descriptions.push(detections.descriptor);
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    );
}