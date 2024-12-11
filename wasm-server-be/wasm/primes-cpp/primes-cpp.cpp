#include <emscripten/bind.h>
#include <emscripten/val.h>

#include <iostream>
#include <vector>
#include <cmath>
#include <chrono>

bool is_prime(unsigned long n) {
    if( n <= 1 ) {
        return false;
    }
    for(unsigned long i = 2; i*i <= n; i++) {
        if(n % i == 0) {
            return false;
        }
    }
    return true;
}

emscripten::val generate_primes(unsigned long start,unsigned long end){
    emscripten::val primes = emscripten::val::array();
    size_t index = 0;
    for (unsigned long i = start; i <= end; i++) {
        if (is_prime(i)) {
            primes.set(index++, i);
        }
    }
    return primes;
}

// WebAssembly exposed function
emscripten::val wasmMain(emscripten::val args) {
    emscripten::val result = emscripten::val::array();

    // Input validation
    if (!args.isArray()) {
        std::cerr << "Error: Expected array of arguments" << std::endl;
        return result;
    }

    // Get array length using proper method
    int argsLength = args["length"].as<int>();

    if (argsLength < 2) {
        std::cerr << "Error: Not enough arguments" << std::endl;
        return result;
    }

    // Extract arguments
    int start_num = args[0].as<int>();
    int end_num = args[1].as<int>();

    std::chrono::steady_clock::time_point begin = std::chrono::steady_clock::now();
    result = generate_primes(start_num, end_num);
    std::chrono::steady_clock::time_point end = std::chrono::steady_clock::now();

    std::cout << "Found " << result["length"].as<int>() << " Prime numbers in range from "
    << start_num << " to " << end_num << "!" << std::endl;
    std::cout << "Time difference = " << std::chrono::duration_cast<std::chrono::microseconds>(end - begin).count() << "[µs]" << std::endl;
    std::cout << "Time difference = " << std::chrono::duration_cast<std::chrono::nanoseconds> (end - begin).count() << "[ns]" << std::endl;
    std::cout << "Time difference = " << std::chrono::duration_cast<std::chrono::seconds>(end - begin).count() << "[s]" << std::endl;

    return result;
}

EMSCRIPTEN_BINDINGS(module) {
    function("wasmMain", &wasmMain);
}

