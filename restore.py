import json

def restore_from_transcript(transcript_path, target_files):
    with open(transcript_path, 'r') as f:
        for line in f:
            data = json.loads(line)
            if 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['name'] == 'write_to_file':
                        target = call['args'].get('TargetFile', '')
                        for tf in target_files:
                            if tf in target:
                                content = call['args']['CodeContent']
                                with open(tf, 'w') as out:
                                    out.write(content)
                                print(f"Restored {tf}")

t3 = "/Users/rodrigoteixeiramartins/.gemini/antigravity/brain/0ee0f434-6f16-42f6-b942-d4b61a9935f3/.system_generated/logs/transcript_full.jsonl"

restore_from_transcript(t3, ["src/App.jsx", "src/pages/EmployeeDashboard.jsx"])
