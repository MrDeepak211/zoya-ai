# Zoya AI: Mobile Integration Guide

This project is currently implemented as a **Futuristic Web Companion** to allow for immediate preview and interaction. To move this to the **Android App** you described (Flutter/Kotlin/llama.cpp), follow these architectural steps:

## 1. Local AI Engine (llama.cpp)
- **Repo:** Integrate [llama.cpp-android](https://github.com/ggerganov/llama.cpp) using JNI/Kotlin.
- **Model:** Download a quantized GGUF model (e.g., `TinyLlama-1.1B-Chat-v1.0.Q4_K_M.gguf`) to the device's internal storage.
- **Service:** Replace `src/services/aiService.ts` with a MethodChannel in Flutter that calls the native Kotlin llama.cpp wrapper.

## 2. Emotional Memory (Hive/SQFLite)
- Use the **Hive** package in Flutter to mirror the `MemoryEngine` logic.
- Encrypt the box using `Hive.generateSecureKey()` to meet the security requirements.

## 3. Holographic Visuals
- Use **Flutter Scene** or **ThreeDart** to port the `HolographicOrb.tsx` implementation.
- Alternatively, use **Rive** for the animated anime-style avatar with emotional triggers.

## 4. HUD Interface
- The UI in this web project uses **Tailwind CSS** and **Framer Motion**.
- Port this to Flutter using `Stack`, `BackdropFilter` (for Glassmorphism), and `CustomPainter` for the HUD lines.

## 5. Offline Speech
- Use the `flutter_tts` package for TTS and `speech_to_text` for voice input.
- For high-quality emotional voices, consider local model TTS engines like **Sherpa-ONNX**.

---
*Created with care by Zoya's architects.*
