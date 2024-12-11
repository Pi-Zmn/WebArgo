"use client"

import React, {useRef, useState} from 'react';

export interface InteractiveCanvasProps {
    width: number;
    height: number;
    size: number;
    jobName: string;
}

export default function InteractiveCanvas({width, height, size, jobName}: InteractiveCanvasProps) {
    const backendURLAPI: string = 'http://' + process.env.NEXT_PUBLIC_BACKEND + ':' + process.env.NEXT_PUBLIC_WS_WORKER;
    const srcPrefix = backendURLAPI + `/wasm/${jobName}/results/Task-`
    const thumbnailIndex: number = size * size;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgThumbnailRef = useRef<HTMLImageElement>(null);
    const imgSectorRef = useRef<HTMLImageElement>(null);

    const [imgSectorIndex, setImgSectorIndex] = useState<number>(-1);

    const drawSectors = () => {
        const img = imgThumbnailRef.current;
        const canvas = canvasRef.current;

        if (canvas && img) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                /*ctx.drawImage(img, 0, 0, width, height);*/
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 4;

                ctx.beginPath();
                for (let i = 0; i < size - 1; i++) {
                    ctx.moveTo((i + 1) * (width / size), 0);
                    ctx.lineTo((i + 1) * (width / size), height);
                    ctx.moveTo(0, (i + 1) * (height / size));
                    ctx.lineTo(width, (i + 1) * (height / size));
                }
                ctx.stroke();
            }
        }
    }

    const selectSector = (e: any) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            console.log(`${x} | ${y}`);

            let sectorX = -1;
            for (let xStep = 0; xStep < size; xStep++) {
                if (x < (xStep + 1) * (width/size)) {
                    sectorX = xStep;
                    break;
                }
            }

            let sectorY = -1;
            for (let yStep = 0; yStep < size; yStep++) {
                if (y < (yStep + 1) * (width/size)) {
                    sectorY = yStep;
                    break;
                }
            }

            if (sectorX >= 0 && sectorY >= 0) {
                const sectorIndex = sectorX + size * sectorY;
                console.log('Clicked Sector: : ', sectorIndex);
                setImgSectorIndex(sectorIndex);
            }
        }
    }

    return (
        <div>
            <h1>Mandelbrot {size}x{size}</h1>
            <div className="mandelbrot-thumbnail-container" style={{width: width + 'px', height: height + 'px'}}>
                <img
                    className="mandelbrot-thumbnail"
                    src={srcPrefix + `${thumbnailIndex}.png`}
                    alt={"Mandelbrot Thumbnail Image"}
                    ref={imgThumbnailRef}
                    width={width}
                    height={width}
                    onLoad={drawSectors}
                />
                <canvas
                    className="mandelbrot-thumbnail"
                    ref={canvasRef}
                    width={width}
                    height={height}
                    onClick={selectSector}
                />
            </div>
            {imgSectorIndex >= 0 ?
                <div>
                    <h1>Sector #{imgSectorIndex}</h1>
                    <img
                        src={srcPrefix + `${imgSectorIndex}.png`}
                        alt={"Mandelbrot Thumbnail Image"}
                        ref={imgSectorRef}
                        width={width * 3}
                        height={height * 3}
                    />
                </div>
                :
                <p>Select a Part of the Mandelbrot Graph to view in detail</p>
            }
        </div>
    );
};
