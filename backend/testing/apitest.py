import google.generativeai as genai
import os

# Put your actual key here for the test
api_key = "no"
genai.configure(api_key=api_key)

print("My Available Models:")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"Error: {e}")