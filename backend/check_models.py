from services.clients import kolosal_client

try:
    models = kolosal_client.models.list()
    print("Available models:")
    for model in models.data:
        print(f"- {model.id}")
except Exception as e:
    print(f"Error listing models: {e}")
