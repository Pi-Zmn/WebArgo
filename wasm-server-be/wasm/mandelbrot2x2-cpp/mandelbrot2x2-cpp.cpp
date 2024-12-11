#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <complex>
#include <vector>
#include <cmath>
#include <chrono>
#include <iostream>
#include "lodepng.h"

using namespace emscripten;

// Structure to hold iteration result and smooth coloring value
struct IterationResult {
    int iterations;
    double smooth_value;
};

// Color structure
struct Color {
    uint8_t r;
    uint8_t g;
    uint8_t b;
    uint8_t a;
};

// Mandelbrot calculation function
IterationResult mandelbrot(std::complex<double> z, std::complex<double> c, int maxIterations) {
    std::complex<double> v(0, 0);

    for (int i = 0; i < maxIterations; i++) {
        if (std::abs(z) > 2.0) {
            double log_zn = std::log(std::norm(z)) / 2.0;
            double nu = std::log(log_zn / std::log(2.0)) / std::log(2.0);
            return {i, static_cast<double>(i) + 1.0 - nu};
        }
        z = z * z + c;
        if (z == v) {
            return {maxIterations, 0.0};
        }
        v = z;
    }
    return {maxIterations, 0.0};
}

// Color calculation function
Color colorize(double t) {
    t = fmod(t * 0.1, 1.0); // Adjust color cycle frequency
    double hue = 6.0 * t;
    double saturation = 1.0;
    double value = 1.0;

    if (t >= 1.0) {
        return {0, 0, 0, 255};
    }

    int hi = static_cast<int>(std::floor(hue));
    double f = hue - hi;
    double p = value * (1.0 - saturation);
    double q = value * (1.0 - saturation * f);
    double tt = value * (1.0 - saturation * (1.0 - f));

    double r = 0, g = 0, b = 0;
    switch (hi % 6) {
        case 0: r = value; g = tt; b = p; break;
        case 1: r = q; g = value; b = p; break;
        case 2: r = p; g = value; b = tt; break;
        case 3: r = p; g = q; b = value; break;
        case 4: r = tt; g = p; b = value; break;
        case 5: r = value; g = p; b = q; break;
    }

    return {
        static_cast<uint8_t>(r * 255),
        static_cast<uint8_t>(g * 255),
        static_cast<uint8_t>(b * 255),
        255
    };
}

// Main function to generate Mandelbrot set
std::vector<unsigned char> generateMandelbrot(int width, int height, int maxIterations,
                                            double realMin, double realMax,
                                            double imagMin, double imagMax) {
    std::vector<unsigned char> imageData(width * height * 4);

    // Calculate Mandelbrot for each pixel
    for (int py = 0; py < height; py++) {
        double y = imagMax - static_cast<double>(py) / height * (imagMax - imagMin);
        for (int px = 0; px < width; px++) {
            double x = static_cast<double>(px) / width * (realMax - realMin) + realMin;
            std::complex<double> z(x, y);
            std::complex<double> c = z;

            auto [iteration, smooth] = mandelbrot(z, c, maxIterations);
            Color color;

            if (iteration >= maxIterations) {
                color = {0, 0, 0, 255}; // Black
            } else {
                color = colorize(smooth);
            }

            // Set pixel in RGBA format
            size_t idx = (py * width + px) * 4;
            imageData[idx] = color.r;
            imageData[idx + 1] = color.g;
            imageData[idx + 2] = color.b;
            imageData[idx + 3] = color.a;
        }
    }

    return imageData;
}

// WebAssembly exposed function
val wasmMain(val args) {
    // Input validation
    if (!args.isArray()) {
        std::cerr << "Error: Expected array of arguments" << std::endl;
        return val::null();
    }

    // Get array length using proper method
    int argsLength = args["length"].as<int>();

    if (argsLength < 7) {
        std::cerr << "Error: Not enough arguments" << std::endl;
        return val::null();
    }

    // Extract arguments
    int width = args[0].as<int>();
    int height = args[1].as<int>();
    int maxIterations = args[2].as<int>();
    double realMin = args[3].as<double>();
    double realMax = args[4].as<double>();
    double imagMin = args[5].as<double>();
    double imagMax = args[6].as<double>();

    auto startTime = std::chrono::high_resolution_clock::now();
    std::cout << "Generating PNG of Mandelbrot set..." << std::endl;

    // Generate the Mandelbrot image data
    auto imageData = generateMandelbrot(width, height, maxIterations,
                                      realMin, realMax, imagMin, imagMax);

    // Encode to PNG
    std::vector<unsigned char> pngData;
    unsigned error = lodepng::encode(pngData, imageData, width, height);

    if (error) {
        std::cerr << "PNG encoding error: " << error << std::endl;
        return val::null();
    }

    auto endTime = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime);
    std::cout << "Mandelbrot PNG generation completed in " << duration.count() << "ms" << std::endl;

    // Create JavaScript Uint8Array from the PNG data
    val uint8Array = val::global("Uint8Array").new_(pngData.size());
    uint8Array.call<void>("set", val(typed_memory_view(pngData.size(), pngData.data())));

    return uint8Array;
}

EMSCRIPTEN_BINDINGS(module) {
    function("wasmMain", &wasmMain);
}
