def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

def generate_primes(start, end, result):
    for i in range(start, end + 1):
        if is_prime(i):
            result.append(i)

def main(inputArgs=[1, 100]):
    result = []
    generate_primes(int(inputArgs[0]), int(inputArgs[1]), result)
    return result