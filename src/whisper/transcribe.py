import whisper
import sys
import json

def main():
    if len(sys.argv) != 2:
        print(json.dumps({ "error": "Audio file path not provided" }))
        sys.exit(1)

    audio_path = sys.argv[1]

    try:
        model = whisper.load_model("base")  # Can use 'tiny', 'small', 'medium', 'large'
        result = model.transcribe(audio_path)
        print(json.dumps({ "text": result["text"] }))
    except Exception as e:
        print(json.dumps({ "error": str(e) }))
        sys.exit(1)

if __name__ == "__main__":
    main()
