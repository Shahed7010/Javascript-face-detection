const imageUpload = document.getElementById('imageUpload');

Promise.all([
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
]).then(start);

function start() {
    const container = document.createElement('div');
    container.style.position = 'relative';
    document.body.append(container);

    imageUpload.addEventListener('change', async () => {
        const image = await faceapi.bufferToImage(imageUpload.files[0]);
        container.append(image);

        const canvas = faceapi.createCanvasFromMedia(image);
        container.append(canvas);

        const displaySize = { width: image.width, height: image.height };
        faceapi.matchDimensions(canvas, displaySize);

        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

        const resizeDetections = faceapi.resizeResults(detections, displaySize);
        console.log(resizeDetections);
        resizeDetections.forEach(detection => {
            const box = detection.detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, { label: 'Face' });
            console.log(drawBox);
            drawBox.draw(canvas);
        });

        document.body.append(detections.length);


    });
}

// video.addEventListener('play', () => {
//     const canvas = faceapi.createCanvasFromMedia(video);
//     document.body.append(canvas);
//     const displaySize = { width: video.width, height: video.height };
//     faceapi.matchDimensions(canvas, displaySize);


//     setInterval(async () => {
//         const detection = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
//             .withFaceLandmarks()
//             .withFaceExpressions();
//         const resizeDetections = faceapi.resizeResults(detection, displaySize);

//         canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

//         faceapi.draw.drawDetections(canvas, resizeDetections);
//         faceapi.draw.drawFaceLandmarks(canvas, resizeDetections);
//         faceapi.draw.drawFaceExpressions(canvas, resizeDetections);

//     }, 100)
// })