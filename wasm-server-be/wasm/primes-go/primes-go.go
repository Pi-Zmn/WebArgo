package main

import (
	"fmt"
	"strconv"
	"time"
	"syscall/js"
)

func isPrime(n uint32) bool {
	if n <= 1 {
		return false
	}
	for i := uint32(2); i*i <= n; i++ {
		if n%i == 0 {
			return false
		}
	}
	return true
}

func generatePrimes(start, end uint32) []any {
	var result []any
	for i := start; i <= end; i++ {
		if isPrime(i) {
			result = append(result, i)
		}
	}
	return result
}

func wasmMain(this js.Value, args []js.Value) any {
	var startNum uint32 = 1
	var endNum uint32 = 1000
	var result []any

	if len(args) == 2 {
		start, err1 := strconv.ParseUint(args[0].String(), 10, 32)
		end, err2 := strconv.ParseUint(args[1].String(), 10, 32)
		if err1 != nil || err2 != nil {
			fmt.Println("Invalid arguments")
			return result
		}
		startNum = uint32(start)
		endNum = uint32(end)
	}


	startTime := time.Now()
	result = generatePrimes(startNum, endNum)
	endTime := time.Now()

	fmt.Printf("Found %d Prime numbers in range from %d to %d!\n", len(result), startNum, endNum)
	fmt.Printf("Time difference = %d[µs]\n", endTime.Sub(startTime).Microseconds())
	fmt.Printf("Time difference = %d[ns]\n", endTime.Sub(startTime).Nanoseconds())
	fmt.Printf("Time difference = %d[s]\n", endTime.Sub(startTime).Seconds())

	return result
}

func main() {
    fmt.Println("Hello Webassembly")
    c := make(chan bool)
    js.Global().Set("wasmMain", js.FuncOf(wasmMain))
    <-c
}

