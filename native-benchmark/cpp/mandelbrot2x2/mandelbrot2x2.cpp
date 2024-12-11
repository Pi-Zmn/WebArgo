#include <iostream>
#include <vector>
#include <complex>
#include <chrono>
#include <cmath>
#include <filesystem>
#include <system_error>

#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "stb_image_write.h"

// Structure to hold RGB colors
struct Color {
    uint8_t r, g, b, a;
    Color(uint8_t r, uint8_t g, uint8_t b, uint8_t a = 255) 
        : r(r), g(g), b(b), a(a) {}
};

// Function declarations
void generatePNG(int counter, int width, int height, int maxIterations,
                double realMin, double realMax, double imagMin, double imagMax);
std::pair<int, double> mandelbrot(std::complex<double> z, std::complex<double> c, int maxIterations);
Color colorize(double t);

int main() {
    auto startTime = std::chrono::high_resolution_clock::now();

    // Create gfx directory if it doesn't exist
    std::error_code ec;
    if (!std::filesystem::create_directory("gfx", ec) && ec) {
        std::cerr << "Warning: Could not create directory: " << ec.message() << '\n';
    }

    // Set Parameters
    const int width = 1500;
    const int height = 1500;
    const int maxIterations = 3000;
    const double realMin = -2.0;
    const double realMax = 1.0;
    const double imagMin = -1.5;
    const double imagMax = 1.5;
    const int gridSize = 2;
    int counter = 0;
    const double realStep = (realMax - realMin) / gridSize;
    const double imagStep = (imagMax - imagMin) / gridSize;

    generatePNG(counter++, width, height, maxIterations, realMin, realMax, imagMin, imagMax);

    // Generating Grid
    for (int y = 0; y < gridSize; y++) {
        double imagLower = imagMax - ((y + 1) * imagStep);
        double imagUpper = imagMax - (y * imagStep);
        for (int x = 0; x < gridSize; x++) {
            double realLower = realMin + (x * realStep);
            double realUpper = realMin + ((x + 1) * realStep);
            generatePNG(counter++, width, height, maxIterations, realLower, realUpper, imagLower, imagUpper);
        }
    }

    auto endTime = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime);
    std::cout << "Mandelbrot PNG generation completed in " << duration.count() << "ms\n";

    return 0;
}

void generatePNG(int counter, int width, int height, int maxIterations,
                double realMin, double realMax, double imagMin, double imagMax) {
    std::vector<uint8_t> buffer(width * height * 4, 0);  // 4 channels: RGBA
    std::cout << "Generating PNG #" << counter << " of Mandelbrot set...\n";

    // Calculate Mandelbrot for each Pixel
    for (int py = 0; py < height; py++) {
        double y = imagMax - double(py)/height * (imagMax-imagMin);
        for (int px = 0; px < width; px++) {
            double x = double(px)/width * (realMax-realMin) + realMin;
            
            std::complex<double> z(x, y);
            std::complex<double> c = z;
            
            auto [iteration, smooth] = mandelbrot(z, c, maxIterations);
            
            // Paint Pixel depending on Iteration count
            Color color = (iteration >= maxIterations) ? Color(0, 0, 0) : colorize(smooth);
            
            // Set pixel in buffer (RGBA format)
            size_t idx = (py * width + px) * 4;
            buffer[idx] = color.r;
            buffer[idx + 1] = color.g;
            buffer[idx + 2] = color.b;
            buffer[idx + 3] = color.a;
        }
    }

    // Set maximum compression level
    stbi_write_png_compression_level = 9;  // Maximum compression (0-9)

    // Save PNG
    char filename[100];
    sprintf(filename, "gfx/mandelbrot_%d.png", counter);
    int success = stbi_write_png(filename, width, height, 4, buffer.data(), width * 4);
    
    if (!success) {
        std::cerr << "Failed to write PNG file: " << filename << std::endl;
    }
}

std::pair<int, double> mandelbrot(std::complex<double> z, std::complex<double> c, int maxIterations) {
    std::complex<double> v;
    for (int i = 0; i < maxIterations; i++) {
        if (std::abs(z) > 2.0) {
            double log_zn = std::log(std::real(z)*std::real(z) + std::imag(z)*std::imag(z)) / 2.0;
            double nu = std::log(log_zn / std::log(2.0)) / std::log(2.0);
            return {i, double(i) + 1.0 - nu};
        }
        z = z*z + c;
        if (z == v) {
            return {maxIterations, 0.0};
        }
        v = z;
    }
    return {maxIterations, 0.0};
}

Color colorize(double t) {
    t = fmod(t * 0.1, 1.0); // Adjust color cycle frequency
    double hue = 6.0 * t;
    double saturation = 1.0;
    double value = 1.0;
    
    if (t >= 1.0) {
        return Color(0, 0, 0);
    }

    int hi = static_cast<int>(floor(hue));
    double f = hue - hi;
    double p = value * (1.0 - saturation);
    double q = value * (1.0 - saturation * f);
    double tt = value * (1.0 - saturation * (1.0 - f));

    double r, g, b;
    switch (hi % 6) {
        case 0: r = value; g = tt; b = p; break;
        case 1: r = q; g = value; b = p; break;
        case 2: r = p; g = value; b = tt; break;
        case 3: r = p; g = q; b = value; break;
        case 4: r = tt; g = p; b = value; break;
        case 5: r = value; g = p; b = q; break;
    }

    return Color(
        static_cast<uint8_t>(r * 255),
        static_cast<uint8_t>(g * 255),
        static_cast<uint8_t>(b * 255)
    );
}
