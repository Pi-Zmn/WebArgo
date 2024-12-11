package main

import (
    "os"
    "fmt"
    "image"
    "image/color"
    "image/png"
    "math"
    "math/cmplx"
    "time"
)

func main() {
    startTime := time.Now()

    // Set Parameters
    width := 1500
    height := 1500
    maxIterations := 3000
    realMin := -2.0
    realMax := 1.0
    imagMin := -1.5
    imagMax := 1.5
    gridSize := 10
    counter := 0
    realStep := (realMax - realMin) / float64(gridSize)
    imagStep := (imagMax - imagMin) / float64(gridSize) 

    generatePNG(counter, width, height, maxIterations, realMin, realMax, imagMin, imagMax)
    counter++
    // Generating Grid
    for y := 0; y < gridSize; y++ {
        imagLower := imagMax - (float64(y + 1) * imagStep)
        imagUpper := imagMax - (float64(y) * imagStep)
        for x := 0; x < gridSize; x++ {
            realLower := realMin + (float64(x) * realStep)
            realUpper := realMin + (float64(x + 1) * realStep)
            generatePNG(counter, width, height, maxIterations, realLower, realUpper, imagLower, imagUpper)
            counter++
        }   
    }

    // Calculate and Print Computation Time
    elapsedTime := time.Since(startTime)
    fmt.Printf("Mandelbrot PNG generation completed in %v\n", elapsedTime)
}

// Generate Mandelbrot PNG
func generatePNG(counter, width, height, maxIterations int, realMin, realMax, imagMin, imagMax float64) {
    img := image.NewRGBA(image.Rect(0, 0, width, height))
    fmt.Printf("Generating PNG #%v of Mandelbrot set...\n", counter)

    // Calculate Mandelbrot for each Pixel
    for py := 0; py < height; py++ {
        y := imagMax - float64(py)/float64(height)*(imagMax-imagMin)
        for px := 0; px < width; px++ {
            x := float64(px)/float64(width)*(realMax-realMin) + realMin
            z := complex(x, y)
            c := z
            iteration, smooth := mandelbrot(z, c, maxIterations)

            // Paint Pixel depending on Iteration count
            if iteration >= maxIterations {
                img.Set(px, py, color.Black)
            } else {
                img.Set(px, py, colorize(smooth))
            }
        }
    }

    // Save PNG
    f, _ := os.Create(fmt.Sprintf("./gfx/mandelbrot_%d.png", counter))
    png.Encode(f, img)
    f.Close()
}

// Mandelbrot Algorithm
func mandelbrot(z, c complex128, maxIterations int) (int, float64) {
    var v complex128
    for i := 0; i < maxIterations; i++ {
        if cmplx.Abs(z) > 2 {
            log_zn := math.Log(real(z)*real(z) + imag(z)*imag(z)) / 2
            nu := math.Log(log_zn / math.Log(2)) / math.Log(2)
            return i, float64(i) + 1 - nu
        }
        z = z*z + c
        if z == v {
            return maxIterations, 0
        }
        v = z
    }
    return maxIterations, 0
}

// Set Color for Pixel
func colorize(t float64) color.Color {
    t = math.Mod(t*0.1, 1.0) // Adjust color cycle frequency
    hue := 6 * t
    saturation := 1.0
    value := 1.0
    if t >= 1.0 {
        hue = 0
        saturation = 0
        value = 0
    }

    hi := math.Floor(hue)
    f := hue - hi
    p := value * (1 - saturation)
    q := value * (1 - saturation*f)
    t = value * (1 - saturation*(1-f))

    var r, g, b float64
    switch int(hi) % 6 {
        case 0:
            r, g, b = value, t, p
        case 1:
            r, g, b = q, value, p
        case 2:
            r, g, b = p, value, t
        case 3:
            r, g, b = p, q, value
        case 4:
            r, g, b = t, p, value
        case 5:
            r, g, b = value, p, q
    }

    return color.RGBA{
        uint8(r * 255),
        uint8(g * 255),
        uint8(b * 255),
        255,
    }
}

