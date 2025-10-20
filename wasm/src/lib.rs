use wasm_bindgen::prelude::*;

// This is called when the wasm module is instantiated
// Skip during tests to avoid entry point conflicts with test harness
#[cfg(not(test))]
#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    // Set panic hook for better error messages in the browser console (dev only)
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();

    Ok(())
}

/// A simple test function to verify the Rust -> WASM -> TypeScript pipeline works
#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {} from Rust + WASM! (Auto-rebuilt!)", name)
}

/// Example: Calculate a hash or perform heavy computation
/// This demonstrates why Rust + WASM is beneficial for performance
#[wasm_bindgen]
pub fn compute_hash(input: &str) -> u64 {
    // Simple hash function (not cryptographic - just for demo)
    let mut hash: u64 = 0;
    for byte in input.bytes() {
        hash = hash.wrapping_mul(31).wrapping_add(byte as u64);
    }
    hash
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_greet() {
        assert_eq!(greet("World"), "Hello, World from Rust + WASM! (Auto-rebuilt!)");
    }

    #[wasm_bindgen_test]
    fn test_compute_hash() {
        let hash1 = compute_hash("test");
        let hash2 = compute_hash("test");
        let hash3 = compute_hash("different");

        assert_eq!(hash1, hash2);
        assert_ne!(hash1, hash3);
    }
}
