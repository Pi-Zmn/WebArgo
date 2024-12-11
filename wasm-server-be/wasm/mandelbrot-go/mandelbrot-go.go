package main

import (
	"bytes"
	"strconv"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"math"
	"math/cmplx"
	"syscall/js"
	"time"
)

func main() {
    fmt.Println("Hello Webassembly")
    c := make(chan bool)
    js.Global().Set("wasmMain", js.FuncOf(wasmMain))
    <-c
}

func wasmMain(this js.Value, args []js.Value) any {
	startTime := time.Now()

    // Get Input Arguments
	width, _ := strconv.Atoi(args[0].String())
	height, _ := strconv.Atoi(args[1].String())
	maxIterations, _ := strconv.Atoi(args[2].String())
	realMin, _ := strconv.ParseFloat(args[3].String(), 64)
	realMax, _ := strconv.ParseFloat(args[4].String(), 64)
	imagMin, _ := strconv.ParseFloat(args[5].String(), 64)
	imagMax, _ := strconv.ParseFloat(args[6].String(), 64)

	img := image.NewRGBA(image.Rect(0, 0, width, height))
    fmt.Println("Generating PNG of Mandelbrot set... ")

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

    // Generate PNG BLOB
	var buf bytes.Buffer
	png.Encode(&buf, img)

	elapsedTime := time.Since(startTime)
	fmt.Printf("Mandelbrot PNG generation completed in %v\n", elapsedTime)

	// Convert []byte to JS Uint8Array
	uint8Array := js.Global().Get("Uint8Array").New(buf.Len())
	js.CopyBytesToJS(uint8Array, buf.Bytes())

	return uint8Array
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

