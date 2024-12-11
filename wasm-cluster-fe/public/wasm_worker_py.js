// web worker Python (Pyodide)

self.onmessage = async function(event) {
    const { eventType, eventData } = event.data;
    switch (eventType) {
        case 'INIT':
            try {
                // TODO: Download all required files to Backend (?)
                await self.importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js")

                /* Setup Pyodide */
                pyodide = await loadPyodide()

                /* Load Python File */
                const pyFile = await fetch(eventData + '.py')
                if (!pyFile.ok) {
                    console.log('Unable to Load Python Script')
                    break;
                }
                const pyFileText = await pyFile.text()

                /* Load Python Package */
                //await pyodide.loadPackage(["micropip"]); // Hier eigenes Package oder Wheel?
                await pyodide.loadPackagesFromImports(pyFileText);

                /* Execute Python Script to load everything into Context */
                await pyodide.runPythonAsync(pyFileText)

                console.log('Successfully instantiated Pyodide Module')
                self.postMessage({
                    eventType: eventType,
                    eventData: true
                });
            } catch (e) {
                console.log('Unable to Load Pyodide Script')
                console.log(e)
            }
            break;
        case 'RUN':
            if (pyodide) {
                const startTime = performance.now();
                let task = eventData
                /* Execute Python-main with Input Args */
                //task.result = JSON.parse(await pyodide.runPythonAsync(`main([${task.input}])`))
                task.result = JSON.parse(await pyodide.runPythonAsync(`main(${JSON.stringify(task.input)})`))
                const endTime = performance.now();
                console.log(`Execution time: ${endTime - startTime} ms`);
                task.done = true
                task.runTime = endTime - startTime
                self.postMessage({
                    eventType: eventType,
                    eventData: task
                });
            } else {
                console.log('No WASM Module was instantiated');
            }
            break;
        default:
            console.log('Worker cant process given Event')
    }
};
